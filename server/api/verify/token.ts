import { requireAuthenticatedUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';

const logger = createLogger('auth-verify-token');

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthenticatedUser(event);

    return {
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        address: user.address,
        number: user.number,
      }
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore generale verifica token', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore interno del server'
    });
  }
});
