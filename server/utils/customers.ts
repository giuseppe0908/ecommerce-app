import { PaymentStatus, Prisma } from '@prisma/client';

export const customerDetailsInclude = {
  orders: {
    select: {
      id: true,
      createdAt: true,
      price: true,
      paymentStatus: true,
      shippingAddress: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
  tokens: {
    select: {
      id: true,
      expiresAt: true,
    },
  },
} satisfies Prisma.UserInclude;

function resolveCustomerName(user: {
  name?: string | null;
  surname?: string | null;
  email?: string | null;
}) {
  const fullName = [user.name, user.surname].filter(Boolean).join(' ').trim();
  return fullName || user.email || 'Cliente';
}

function collectAddresses(user: {
  address?: string | null;
  orders: Array<{ shippingAddress?: string | null }>;
}) {
  const addresses = new Set<string>();

  if (user.address) {
    addresses.add(user.address.trim());
  }

  for (const order of user.orders) {
    if (order.shippingAddress) {
      addresses.add(order.shippingAddress.trim());
    }
  }

  return Array.from(addresses).filter(Boolean);
}

export function serializeAdminCustomer(
  user: Prisma.UserGetPayload<{ include: typeof customerDetailsInclude }>
) {
  const paidOrders = user.orders.filter(
    (order) => order.paymentStatus === PaymentStatus.SUCCEEDED
  );
  const totalSpent = paidOrders.reduce((sum, order) => sum + Number(order.price ?? 0), 0);
  const lastOrderDate = user.orders[0]?.createdAt ?? null;
  const activeSessions = user.tokens.filter((token) => token.expiresAt > new Date()).length;

  return {
    id: user.id,
    name: resolveCustomerName(user),
    email: user.email,
    phone: user.number || '',
    registrationDate: user.createdAt,
    ordersCount: user.orders.length,
    paidOrdersCount: paidOrders.length,
    totalSpent: Number(totalSpent.toFixed(2)),
    lastOrderDate,
    status: activeSessions > 0 ? 'active' : 'inactive',
    activeSessions,
    addresses: collectAddresses(user),
  };
}
