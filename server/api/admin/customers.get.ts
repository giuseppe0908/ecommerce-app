import prisma from '../../utils/prisma';
import { requireAdminUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';
import {
  customerDetailsInclude,
  serializeAdminCustomer,
} from '../../utils/customers';

const logger = createLogger('admin-customers-list');

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      include: customerDetailsInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      customers: customers.map(serializeAdminCustomer),
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore recupero clienti admin', {
      requestId: event.context.requestId,
      error,
    });

    throw createError({
      statusCode: 500,
      message: 'Errore durante il recupero dei clienti',
    });
  }
});
