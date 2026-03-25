import { getRouterParam } from 'h3';
import { getCheckoutSessionOrThrow, serializeCheckoutSession } from '../../../utils/checkout';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'GET') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  const checkoutSessionId = getRouterParam(event, 'id');
  if (!checkoutSessionId) {
    throw createError({ statusCode: 400, message: 'Checkout non valido' });
  }

  const checkoutSession = await getCheckoutSessionOrThrow(checkoutSessionId);

  return {
    success: true,
    checkout: serializeCheckoutSession(checkoutSession),
  };
});
