import { PaymentStatus } from '@prisma/client';
import prisma from '../../utils/prisma';
import { requireAdminUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';

const logger = createLogger('admin-statistics');

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalOrders, totalProducts, totalCustomers, revenueAggregate] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          createdAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: { price: true },
      }),
    ]);
    const monthlyRevenue = Number(revenueAggregate._sum.price ?? 0);

    return {
      totalOrders,
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      totalProducts,
      totalCustomers,
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore recupero statistiche admin', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({ statusCode: 500, message: 'Errore interno del server' });
  }
});
