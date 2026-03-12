import { requireAdminUser } from '../../utils/auth-session';
import { createLogger, getApiMetricsSnapshot } from '../../utils/observability';

const logger = createLogger('admin-observability');

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  try {
    return {
      success: true,
      metrics: getApiMetricsSnapshot(),
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore recupero metriche osservabilita', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({ statusCode: 500, message: 'Errore interno del server' });
  }
});
