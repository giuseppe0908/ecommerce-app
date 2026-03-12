import {
  CheckoutStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { createError } from 'h3';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import prisma from './prisma';
import { createLogger } from './observability';

const logger = createLogger('checkout');

const MAX_ITEMS_PER_ORDER = 50;
const CHECKOUT_TTL_MINUTES = 30;
const DEFAULT_CURRENCY = 'eur';
const DEFAULT_SHIPPING_AMOUNT = 0;

const orderItemSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    productId: z.coerce.number().int().positive().optional(),
    codeItem: z.coerce.number().int().positive().optional(),
    quantity: z.coerce.number().int().positive().optional().default(1),
  })
  .refine((item) => item.id || item.productId || item.codeItem, {
    message: 'Identificativo prodotto mancante',
    path: ['id'],
  });

const checkoutBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  surname: z.string().trim().min(1).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  address: z.string().trim().min(1).max(255),
  phone: z.string().trim().min(1).max(50),
  products: z.array(orderItemSchema).min(1).max(MAX_ITEMS_PER_ORDER),
});

const checkoutSessionInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          photo: true,
          price: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  },
  order: {
    select: {
      id: true,
      price: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CheckoutSessionInclude;

type PrismaExecutor = Prisma.TransactionClient | typeof prisma;

type NormalizedCheckoutItem = {
  productId: number;
  quantity: number;
};

type ParsedCheckoutPayload = {
  name: string;
  surname: string;
  email: string;
  address: string;
  phone: string;
  products: NormalizedCheckoutItem[];
};

type CheckoutSessionRecord = Awaited<ReturnType<typeof getCheckoutSessionOrThrow>>;

function parsePositiveInt(value: unknown) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value: number) {
  return roundCurrency(value).toFixed(2);
}

function buildProductMap<T extends { id: number }>(products: T[]) {
  const map = new Map<number, T>();
  for (const product of products) {
    map.set(product.id, product);
  }
  return map;
}

function parseCheckoutItems(rawProducts: unknown[]) {
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    throw createError({ statusCode: 400, message: 'Prodotti ordine mancanti' });
  }

  if (rawProducts.length > MAX_ITEMS_PER_ORDER) {
    throw createError({
      statusCode: 400,
      message: `Numero massimo di articoli superato (${MAX_ITEMS_PER_ORDER})`,
    });
  }

  const quantitiesByProduct = new Map<number, number>();

  for (const rawItem of rawProducts) {
    const item = rawItem as Record<string, unknown>;
    const productId = parsePositiveInt(item?.id ?? item?.productId ?? item?.codeItem);
    const quantity = parsePositiveInt(item?.quantity ?? 1);

    if (!productId || !quantity || quantity <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Dati prodotti non validi',
      });
    }

    const currentQuantity = quantitiesByProduct.get(productId) || 0;
    quantitiesByProduct.set(productId, currentQuantity + quantity);
  }

  return [...quantitiesByProduct.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function mapStripeStatusToPaymentStatus(status?: string | null) {
  switch (status) {
    case 'succeeded':
      return PaymentStatus.SUCCEEDED;
    case 'processing':
      return PaymentStatus.PROCESSING;
    case 'requires_action':
      return PaymentStatus.REQUIRES_ACTION;
    case 'canceled':
      return PaymentStatus.CANCELLED;
    case 'payment_failed':
      return PaymentStatus.FAILED;
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_capture':
    default:
      return PaymentStatus.PENDING;
  }
}

function mapPaymentStatusToCheckoutStatus(paymentStatus: PaymentStatus) {
  switch (paymentStatus) {
    case PaymentStatus.SUCCEEDED:
      return CheckoutStatus.COMPLETED;
    case PaymentStatus.CANCELLED:
      return CheckoutStatus.CANCELLED;
    case PaymentStatus.FAILED:
      return CheckoutStatus.FAILED;
    default:
      return CheckoutStatus.PAYMENT_PENDING;
  }
}

function isTerminalCheckoutStatus(status: CheckoutStatus) {
  return (
    status === CheckoutStatus.COMPLETED ||
    status === CheckoutStatus.CANCELLED ||
    status === CheckoutStatus.EXPIRED ||
    status === CheckoutStatus.FAILED
  );
}

function hasUniqueConstraintTarget(error: unknown, target: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }

  const metaTarget = error.meta?.target;
  if (Array.isArray(metaTarget)) {
    return metaTarget.includes(target);
  }

  return String(metaTarget || '').includes(target);
}

function isCheckoutExpired(checkoutSession: { expiresAt: Date; status: CheckoutStatus }) {
  return (
    checkoutSession.status !== CheckoutStatus.COMPLETED &&
    checkoutSession.status !== CheckoutStatus.CANCELLED &&
    checkoutSession.status !== CheckoutStatus.EXPIRED &&
    checkoutSession.expiresAt.getTime() <= Date.now()
  );
}

async function expireCheckoutSession(checkoutSessionId: string) {
  await prisma.checkoutSession.updateMany({
    where: {
      id: checkoutSessionId,
      status: {
        in: [CheckoutStatus.OPEN, CheckoutStatus.PAYMENT_PENDING, CheckoutStatus.FAILED],
      },
    },
    data: {
      status: CheckoutStatus.EXPIRED,
    },
  });
}

export function parseCheckoutPayload(body: unknown): ParsedCheckoutPayload {
  const parsedBody = checkoutBodySchema.safeParse(body);
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: 'Payload ordine non valido',
      data: parsedBody.error.format(),
    });
  }

  return {
    name: parsedBody.data.name,
    surname: parsedBody.data.surname,
    email: parsedBody.data.email,
    address: parsedBody.data.address,
    phone: parsedBody.data.phone,
    products: parseCheckoutItems(parsedBody.data.products),
  };
}

async function loadProductsForCheckout(
  db: PrismaExecutor,
  items: NormalizedCheckoutItem[],
  options?: {
    enforceAvailability?: boolean;
    unavailableStatusCode?: number;
  }
) {
  const productIds = items.map((item) => item.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      name: true,
      photo: true,
      price: true,
      available_quantity: true,
    },
  });

  if (products.length !== productIds.length) {
    throw createError({
      statusCode: 400,
      message: 'Uno o piu prodotti non sono validi',
    });
  }

  const productMap = buildProductMap(products);

  const enforceAvailability = options?.enforceAvailability ?? true;
  const unavailableStatusCode = options?.unavailableStatusCode ?? 400;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw createError({
        statusCode: 400,
        message: `Prodotto ${item.productId} non trovato`,
      });
    }

    if (enforceAvailability && product.available_quantity < item.quantity) {
      throw createError({
        statusCode: unavailableStatusCode,
        message: `Quantita non disponibile per ${product.name}`,
      });
    }
  }

  return { products, productMap };
}

function computeSubtotal(
  items: NormalizedCheckoutItem[],
  productMap: Map<number, { price: number }>
) {
  return roundCurrency(
    items.reduce((total, item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        return total;
      }
      return total + product.price * item.quantity;
    }, 0)
  );
}

function createCheckoutExpirationDate() {
  return new Date(Date.now() + CHECKOUT_TTL_MINUTES * 60 * 1000);
}

export async function createCheckoutDraft(payload: ParsedCheckoutPayload & { userId?: number | null }) {
  return prisma.$transaction(async (tx) => {
    const { products, productMap } = await loadProductsForCheckout(tx, payload.products);
    const subtotal = computeSubtotal(payload.products, productMap);
    const totalAmount = roundCurrency(subtotal + DEFAULT_SHIPPING_AMOUNT);

    return tx.checkoutSession.create({
      data: {
        userId: payload.userId ?? null,
        customerName: payload.name,
        customerSurname: payload.surname,
        customerEmail: payload.email,
        shippingAddress: payload.address,
        customerPhone: payload.phone,
        currency: DEFAULT_CURRENCY,
        subtotal,
        shippingAmount: DEFAULT_SHIPPING_AMOUNT,
        totalAmount,
        status: CheckoutStatus.OPEN,
        paymentStatus: PaymentStatus.PENDING,
        expiresAt: createCheckoutExpirationDate(),
        items: {
          create: payload.products.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
              productName: product.name,
              productPhoto: product.photo,
            };
          }),
        },
      },
      include: checkoutSessionInclude,
    });
  });
}

export async function getCheckoutSessionOrThrow(checkoutSessionId: string) {
  const checkoutSession = await prisma.checkoutSession.findUnique({
    where: { id: checkoutSessionId },
    include: checkoutSessionInclude,
  });

  if (!checkoutSession) {
    throw createError({ statusCode: 404, message: 'Checkout non trovato' });
  }

  if (isCheckoutExpired(checkoutSession)) {
    await expireCheckoutSession(checkoutSession.id);
    throw createError({ statusCode: 410, message: 'Checkout scaduto. Ripeti l\'ordine.' });
  }

  return checkoutSession;
}

export function serializeCheckoutSession(
  checkoutSession: Awaited<ReturnType<typeof getCheckoutSessionOrThrow>>
) {
  return {
    id: checkoutSession.id,
    status: checkoutSession.status,
    paymentStatus: checkoutSession.paymentStatus,
    expiresAt: checkoutSession.expiresAt,
    completedAt: checkoutSession.completedAt,
    customer: {
      name: checkoutSession.customerName,
      surname: checkoutSession.customerSurname,
      email: checkoutSession.customerEmail,
      address: checkoutSession.shippingAddress,
      phone: checkoutSession.customerPhone,
    },
    amounts: {
      currency: checkoutSession.currency,
      subtotal: checkoutSession.subtotal,
      shipping: checkoutSession.shippingAmount,
      total: checkoutSession.totalAmount,
    },
    items: checkoutSession.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      productName: item.productName,
      productPhoto: item.productPhoto,
      lineTotal: roundCurrency(item.unitPrice * item.quantity),
    })),
    order: checkoutSession.order,
  };
}

export async function syncCheckoutPaymentState(
  checkoutSessionId: string,
  paymentIntentId: string | null,
  paymentStatus: PaymentStatus
) {
  return prisma.$transaction(async (tx) => {
    const checkoutSession = await tx.checkoutSession.findUnique({
      where: { id: checkoutSessionId },
      include: checkoutSessionInclude,
    });

    if (!checkoutSession) {
      throw createError({ statusCode: 404, message: 'Checkout non trovato' });
    }

    if (isCheckoutExpired(checkoutSession)) {
      return tx.checkoutSession.update({
        where: { id: checkoutSession.id },
        data: {
          status: CheckoutStatus.EXPIRED,
        },
        include: checkoutSessionInclude,
      });
    }

    if (checkoutSession.orderId && checkoutSession.order) {
      return checkoutSession;
    }

    if (isTerminalCheckoutStatus(checkoutSession.status)) {
      return checkoutSession;
    }

    if (
      paymentIntentId &&
      checkoutSession.paymentIntentId &&
      checkoutSession.paymentIntentId !== paymentIntentId
    ) {
      logger.warn('Aggiornamento pagamento ignorato per paymentIntent stantio', {
        checkoutSessionId,
        currentPaymentIntentId: checkoutSession.paymentIntentId,
        incomingPaymentIntentId: paymentIntentId,
        currentStatus: checkoutSession.status,
        incomingPaymentStatus: paymentStatus,
      });
      return checkoutSession;
    }

    const status =
      paymentStatus === PaymentStatus.SUCCEEDED
        ? CheckoutStatus.PAYMENT_PENDING
        : mapPaymentStatusToCheckoutStatus(paymentStatus);

    return tx.checkoutSession.update({
      where: { id: checkoutSessionId },
      data: {
        paymentIntentId: paymentIntentId ?? checkoutSession.paymentIntentId ?? undefined,
        paymentStatus,
        status,
      },
      include: checkoutSessionInclude,
    });
  });
}

export function buildPaymentIntentIdempotencyKey(
  checkoutSessionId: string,
  previousPaymentIntentId: string | null | undefined
) {
  return previousPaymentIntentId
    ? `checkout-${checkoutSessionId}-retry-${previousPaymentIntentId}`
    : `checkout-${checkoutSessionId}`;
}

async function resolveOrderUser(
  tx: Prisma.TransactionClient,
  checkoutSession: CheckoutSessionRecord
) {
  const customerProfileData = {
    name: checkoutSession.customerName,
    surname: checkoutSession.customerSurname,
    address: checkoutSession.shippingAddress,
    number: checkoutSession.customerPhone,
  };

  if (checkoutSession.userId) {
    const updatedUser = await tx.user.update({
      where: { id: checkoutSession.userId },
      data: customerProfileData,
    });

    return {
      user: updatedUser,
      isNewUser: false,
    };
  }

  const existingUser = await tx.user.findUnique({
    where: { email: checkoutSession.customerEmail },
  });

  if (existingUser) {
    const updatedUser = await tx.user.update({
      where: { id: existingUser.id },
      data: customerProfileData,
    });

    return {
      user: updatedUser,
      isNewUser: false,
    };
  }

  try {
    const newUser = await tx.user.create({
      data: {
        ...customerProfileData,
        email: checkoutSession.customerEmail,
        password: null,
        role: 'USER',
      },
    });

    return {
      user: newUser,
      isNewUser: true,
    };
  } catch (error) {
    if (!hasUniqueConstraintTarget(error, 'email')) {
      throw error;
    }

    const concurrentUser = await tx.user.findUnique({
      where: { email: checkoutSession.customerEmail },
    });

    if (!concurrentUser) {
      throw error;
    }

    const updatedUser = await tx.user.update({
      where: { id: concurrentUser.id },
      data: customerProfileData,
    });

    return {
      user: updatedUser,
      isNewUser: false,
    };
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

async function reserveInventoryForCheckout(
  tx: Prisma.TransactionClient,
  checkoutSession: CheckoutSessionRecord
) {
  const sortedItems = [...checkoutSession.items].sort((left, right) => left.productId - right.productId);

  for (const item of sortedItems) {
    const reservedStock = await tx.product.updateMany({
      where: {
        id: item.productId,
        available_quantity: {
          gte: item.quantity,
        },
      },
      data: {
        available_quantity: {
          decrement: item.quantity,
        },
      },
    });

    if (reservedStock.count !== 1) {
      throw createError({
        statusCode: 409,
        message: `Quantita non piu disponibile per ${item.productName}`,
      });
    }
  }
}

async function loadExistingFinalizedCheckout(
  checkoutSessionId: string,
  paymentIntentId: string
) {
  const [existingOrder, existingCheckoutSession] = await Promise.all([
    prisma.order.findUnique({
      where: { paymentIntentId },
      include: {
        products: true,
      },
    }),
    prisma.checkoutSession.findUnique({
      where: { id: checkoutSessionId },
      include: checkoutSessionInclude,
    }),
  ]);

  if (!existingOrder || !existingCheckoutSession) {
    return null;
  }

  if (!existingCheckoutSession.orderId) {
    await prisma.checkoutSession.updateMany({
      where: {
        id: checkoutSessionId,
        orderId: null,
      },
      data: {
        orderId: existingOrder.id,
        paymentIntentId,
        paymentStatus: PaymentStatus.SUCCEEDED,
        status: CheckoutStatus.COMPLETED,
        completedAt: existingCheckoutSession.completedAt ?? new Date(),
      },
    });
  }

  const syncedCheckoutSession = await prisma.checkoutSession.findUnique({
    where: { id: checkoutSessionId },
    include: checkoutSessionInclude,
  });

  if (!syncedCheckoutSession) {
    return null;
  }

  return {
    order: existingOrder,
    checkoutSession: syncedCheckoutSession,
    isNewUser: false,
    alreadyFinalized: true,
  };
}

export async function finalizeCheckoutSession(checkoutSessionId: string, paymentIntentId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const checkoutSession = await tx.checkoutSession.findUnique({
        where: { id: checkoutSessionId },
        include: checkoutSessionInclude,
      });

      if (!checkoutSession) {
        throw createError({ statusCode: 404, message: 'Checkout non trovato' });
      }

      if (isCheckoutExpired(checkoutSession)) {
        await tx.checkoutSession.update({
          where: { id: checkoutSession.id },
          data: { status: CheckoutStatus.EXPIRED },
        });
        throw createError({ statusCode: 410, message: 'Checkout scaduto. Ripeti l\'ordine.' });
      }

      if (
        checkoutSession.paymentIntentId &&
        checkoutSession.paymentIntentId !== paymentIntentId
      ) {
        logger.warn('Finalizzazione checkout ignorata per paymentIntent stantio', {
          checkoutSessionId,
          currentPaymentIntentId: checkoutSession.paymentIntentId,
          incomingPaymentIntentId: paymentIntentId,
          status: checkoutSession.status,
        });
        throw createError({
          statusCode: 409,
          message: 'Pagamento non coerente con il checkout corrente',
        });
      }

      if (checkoutSession.orderId && checkoutSession.order) {
        return {
          order: checkoutSession.order,
          checkoutSession,
          isNewUser: false,
          alreadyFinalized: true,
        };
      }

      const items = checkoutSession.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      const { products } = await loadProductsForCheckout(tx, items, {
        enforceAvailability: false,
      });
      const { user, isNewUser } = await resolveOrderUser(tx, checkoutSession);

      await reserveInventoryForCheckout(tx, checkoutSession);

      const order = await tx.order.create({
        data: {
          idUtente: user.id,
          price: checkoutSession.totalAmount,
          subtotal: checkoutSession.subtotal,
          shippingAmount: checkoutSession.shippingAmount,
          currency: checkoutSession.currency,
          status: OrderStatus.PROCESSING,
          paymentStatus: PaymentStatus.SUCCEEDED,
          paymentIntentId,
          customerName: checkoutSession.customerName,
          customerSurname: checkoutSession.customerSurname,
          customerEmail: checkoutSession.customerEmail,
          shippingAddress: checkoutSession.shippingAddress,
          customerPhone: checkoutSession.customerPhone,
          paidAt: new Date(),
          products: {
            create: checkoutSession.items.map((item) => ({
              product: { connect: { id: item.productId } },
              quantity: item.quantity,
            })),
          },
        },
        include: {
          products: true,
        },
      });

      const updatedCheckoutSession = await tx.checkoutSession.update({
        where: { id: checkoutSession.id },
        data: {
          orderId: order.id,
          paymentIntentId,
          paymentStatus: PaymentStatus.SUCCEEDED,
          status: CheckoutStatus.COMPLETED,
          completedAt: checkoutSession.completedAt ?? new Date(),
        },
        include: checkoutSessionInclude,
      });

      return {
        order,
        checkoutSession: updatedCheckoutSession,
        isNewUser,
        alreadyFinalized: Boolean(checkoutSession.orderId),
        products,
      };
    });
  } catch (error) {
    if (!isUniqueConstraintError(error) || !hasUniqueConstraintTarget(error, 'paymentIntentId')) {
      throw error;
    }

    const finalizedCheckout = await loadExistingFinalizedCheckout(checkoutSessionId, paymentIntentId);
    if (!finalizedCheckout) {
      throw error;
    }

    return finalizedCheckout;
  }
}

export async function sendOrderConfirmationEmail({
  checkoutSession,
  orderId,
  isNewUser,
}: {
  checkoutSession: Awaited<ReturnType<typeof getCheckoutSessionOrThrow>>;
  orderId: number;
  isNewUser: boolean;
}) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER o EMAIL_PASS non configurati');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const styleImg = 'width: 72px; height: 72px; border-radius: 8px; object-fit: cover;';

  const productDetails = checkoutSession.items
    .map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      return `
        <li style="display:flex;align-items:center;gap:12px;margin:8px 0;">
          <img style="${styleImg}" src="${item.productPhoto || ''}" alt="${item.productName}" />
          <div>
            <p style="margin:0;"><b>${item.productName}</b> x${item.quantity}</p>
            <p style="margin:0;">€${formatCurrency(lineTotal)}</p>
          </div>
        </li>
      `;
    })
    .join('\n');

  const onboardingMessage = isNewUser
    ? `
      <p style="margin-top:12px;">
        Abbiamo creato il tuo account cliente con questa email.
        Per impostare una password usa la funzione "Password dimenticata".
      </p>
    `
    : '';

  await transporter.sendMail({
    from: emailUser,
    to: checkoutSession.customerEmail,
    subject: `Conferma Ordine #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Ciao ${checkoutSession.customerName || 'cliente'},</p>
        <p>Grazie per il tuo ordine. Ecco i dettagli:</p>
        <ul style="padding-left:0;list-style:none;">${productDetails}</ul>
        <p><b>Totale ordine: €${formatCurrency(checkoutSession.totalAmount)}</b></p>
        ${onboardingMessage}
        <p>Cordiali saluti,<br/>Il team</p>
      </div>
    `,
  });
}

export async function handleCompletedCheckout({
  checkoutSessionId,
  paymentIntentId,
  requestId,
}: {
  checkoutSessionId: string;
  paymentIntentId: string;
  requestId?: string;
}) {
  const result = await finalizeCheckoutSession(checkoutSessionId, paymentIntentId);

  if (!result.alreadyFinalized) {
    try {
      await sendOrderConfirmationEmail({
        checkoutSession: result.checkoutSession,
        orderId: result.order.id,
        isNewUser: result.isNewUser,
      });
    } catch (error) {
      logger.error('Errore invio email ordine', {
        requestId,
        error,
        checkoutSessionId,
        orderId: result.order.id,
      });
    }
  }

  return result;
}

export async function updateCheckoutFromStripeStatus(params: {
  checkoutSessionId: string;
  paymentIntentId: string | null;
  stripeStatus: string | null | undefined;
}) {
  const paymentStatus = mapStripeStatusToPaymentStatus(params.stripeStatus);
  return syncCheckoutPaymentState(params.checkoutSessionId, params.paymentIntentId, paymentStatus);
}
