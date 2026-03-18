import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

export const orderDetailsInclude = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      address: true,
      number: true,
    },
  },
  products: {
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
} satisfies Prisma.OrderInclude;

const adminOrderStatuses = new Set(
  Object.values(OrderStatus).map((status) => status.toLowerCase())
);

function toLowerStatus<T extends string>(status: T | null | undefined) {
  return typeof status === 'string' ? status.toLowerCase() : null;
}

function resolveCustomerName(order: {
  customerName?: string | null;
  customerSurname?: string | null;
  user?: { name?: string | null; surname?: string | null; email?: string | null } | null;
}) {
  const snapshotName = [order.customerName, order.customerSurname].filter(Boolean).join(' ').trim();
  if (snapshotName) return snapshotName;

  const userName = [order.user?.name, order.user?.surname].filter(Boolean).join(' ').trim();
  if (userName) return userName;

  return order.user?.email || 'Cliente';
}

export function serializeOrder(
  order: Prisma.OrderGetPayload<{ include: typeof orderDetailsInclude }>
) {
  const items = order.products.map((item) => {
    const unitPrice = Number(item.product?.price ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return {
      id: item.id,
      productId: item.productId,
      quantity,
      name: item.product?.name || 'Prodotto',
      price: unitPrice,
      imageUrl: item.product?.photo || null,
      lineTotal: Number((unitPrice * quantity).toFixed(2)),
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            price: unitPrice,
            image: item.product.photo,
            photo: item.product.photo,
          }
        : null,
    };
  });

  return {
    id: order.id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: toLowerStatus(order.status) || 'pending',
    paymentStatus: toLowerStatus(order.paymentStatus) || 'pending',
    subtotal: Number(order.subtotal ?? order.price ?? 0),
    shippingAmount: Number(order.shippingAmount ?? 0),
    total: Number(order.price ?? 0),
    currency: order.currency || 'eur',
    customerName: resolveCustomerName(order),
    customerEmail: order.customerEmail || order.user?.email || '',
    customerPhone: order.customerPhone || order.user?.number || '',
    shippingAddress: order.shippingAddress || order.user?.address || '',
    paidAt: order.paidAt,
    items,
    itemsCount: items.length,
    primaryProductId: items[0]?.productId ?? null,
  };
}

export function parseOrderStatusInput(rawStatus: unknown): OrderStatus | null {
  if (typeof rawStatus !== 'string') return null;

  const normalizedStatus = rawStatus.trim().toLowerCase();
  if (!adminOrderStatuses.has(normalizedStatus)) {
    return null;
  }

  return normalizedStatus.toUpperCase() as OrderStatus;
}

export function mapOrderStatusLabel(status: OrderStatus | string | null | undefined) {
  switch (toLowerStatus(status as string)) {
    case 'pending':
      return 'In attesa';
    case 'processing':
      return 'In lavorazione';
    case 'shipped':
      return 'Spedito';
    case 'delivered':
      return 'Consegnato';
    case 'cancelled':
      return 'Annullato';
    default:
      return 'In attesa';
  }
}

export function mapPaymentStatusLabel(status: PaymentStatus | string | null | undefined) {
  switch (toLowerStatus(status as string)) {
    case 'succeeded':
      return 'Pagato';
    case 'processing':
      return 'In elaborazione';
    case 'requires_action':
      return 'Richiede azione';
    case 'failed':
      return 'Fallito';
    case 'cancelled':
      return 'Annullato';
    default:
      return 'In attesa';
  }
}
