import prisma from '../../utils/prisma';
import { requireAuthenticatedUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';
import { orderDetailsInclude, serializeOrder } from '../../utils/orders';

const logger = createLogger('orders-me');

export default defineEventHandler(async (event) => {
  const authUser = await requireAuthenticatedUser(event);

  try {
    const orders = await prisma.order.findMany({
      where: {
        idUtente: authUser.id,
      },
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

    logger.error('Errore recupero ordini utente', {
      requestId: event.context.requestId,
      error,
      userId: authUser.id,
    });

    throw createError({
      statusCode: 500,
      message: 'Errore durante il recupero degli ordini',
    });
  }
});
