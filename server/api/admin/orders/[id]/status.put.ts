import { getRouterParam, readBody } from 'h3';
import { z } from 'zod';
import prisma from '../../../../utils/prisma';
import { requireAdminUser } from '../../../../utils/auth-session';
import { createLogger } from '../../../../utils/observability';
import {
  orderDetailsInclude,
  parseOrderStatusInput,
  serializeOrder,
} from '../../../../utils/orders';

const logger = createLogger('admin-order-status');

const updateOrderStatusSchema = z.object({
  status: z.string().trim().min(1).max(32),
});

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const orderId = Number.parseInt(getRouterParam(event, 'id') || '', 10);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw createError({
      statusCode: 400,
      message: 'ID ordine non valido',
    });
  }

  const body = await readBody(event);
  const parsedBody = updateOrderStatusSchema.safeParse(body);
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: 'Payload aggiornamento stato non valido',
      data: parsedBody.error.format(),
    });
  }

  const nextStatus = parseOrderStatusInput(parsedBody.data.status);
  if (!nextStatus) {
    throw createError({
      statusCode: 400,
      message: 'Stato ordine non supportato',
    });
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingOrder) {
      throw createError({
        statusCode: 404,
        message: 'Ordine non trovato',
      });
    }

    if (existingOrder.status === nextStatus) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: orderDetailsInclude,
      });

      return {
        success: true,
        order: order ? serializeOrder(order) : null,
      };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
      },
      include: orderDetailsInclude,
    });

    return {
      success: true,
      order: serializeOrder(updatedOrder),
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore aggiornamento stato ordine', {
      requestId: event.context.requestId,
      error,
      orderId,
      nextStatus,
    });

    throw createError({
      statusCode: 500,
      message: 'Errore durante l\'aggiornamento dello stato ordine',
    });
  }
});
