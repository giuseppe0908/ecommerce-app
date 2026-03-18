import { createLogger } from '../../utils/observability';
import {
  createCheckoutDraft,
  parseCheckoutPayload,
  serializeCheckoutSession,
} from '../../utils/checkout';
import { requireAuthenticatedUser } from '../../utils/auth-session';

const logger = createLogger('order-checkout');

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  const body = await readBody(event);
  const payload = parseCheckoutPayload(body);

  let authenticatedUser = null;
  try {
    authenticatedUser = await requireAuthenticatedUser(event);
  } catch (error) {
    const statusCode = error?.statusCode || error?.status;
    if (statusCode !== 401) {
      throw error;
    }
  }

  try {
    const checkoutSession = await createCheckoutDraft({
      ...payload,
      userId: authenticatedUser?.id ?? null,
    });

    return {
      success: true,
      message: 'Checkout creato con successo',
      checkout: serializeCheckoutSession(checkoutSession),
    };
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore creazione checkout', {
      requestId: event.context.requestId,
      error,
      email: payload.email,
    });

    throw createError({
      statusCode: 500,
      message: 'Errore durante la preparazione del checkout',
    });
  }
});
