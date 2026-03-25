import { H3Event } from 'h3';
import prisma from '../utils/prisma';
import { requireAdminUser } from '../utils/auth-session';
import { createLogger } from '../utils/observability';

const logger = createLogger('cleanup-tokens');

export default defineEventHandler(async (event: H3Event) => {
  await requireAdminUser(event);

  try {
    const currentDate = new Date();

    const [deletedTokens, deletedResetTokens] = await Promise.all([
      prisma.token.deleteMany({
        where: {
          expiresAt: {
            lt: currentDate,
          },
        },
      }),
      prisma.resetToken.deleteMany({
        where: {
          expiresAt: {
            lt: currentDate,
          },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Pulizia token completata',
      deletedTokens: deletedTokens.count,
      deletedResetTokens: deletedResetTokens.count,
    };
  } catch (error) {
    logger.error('Errore durante la pulizia dei token', {
      requestId: event.context.requestId,
      error,
    });

    throw createError({
      statusCode: 500,
      message: 'Errore durante la pulizia dei token',
    });
  }
});
