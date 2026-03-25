import { clearSessionCookie, revokeUserSession } from '../../utils/session';
import { requireAuthenticatedUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';

const logger = createLogger('auth-logout');

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  let userId: number | null = null;
  let token: string | undefined;

  try {
    const authUser = await requireAuthenticatedUser(event);
    userId = authUser.id;
    token = authUser.token;
  } catch (error: any) {
    if (error?.statusCode && error.statusCode !== 401) {
      throw error;
    }
  }

  try {
    if (userId) {
      await revokeUserSession(userId, token);
    }
  } catch (error) {
    logger.error('Errore revoca sessione', {
      requestId: event.context.requestId,
      error,
      userId,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore interno durante il logout',
    });
  } finally {
    clearSessionCookie(event);
  }

  return { success: true };
});
