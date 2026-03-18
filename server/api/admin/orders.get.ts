import prisma from '../../utils/prisma';
import { requireAdminUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';
import { orderDetailsInclude, serializeOrder } from '../../utils/orders';

const logger = createLogger('admin-orders-list');

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  try {
    const orders = await prisma.order.findMany({
      include: orderDetailsInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      orders: orders.map(serializeOrder),
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore recupero ordini admin', {
      requestId: event.context.requestId,
      error,
    });

    throw createError({
      statusCode: 500,
      message: 'Errore durante il recupero degli ordini',
    });
  }
});
