import { z } from 'zod';
import {
  getCheckoutSessionOrThrow,
  handleCompletedCheckout,
  serializeCheckoutSession,
  updateCheckoutFromStripeStatus,
} from '../../utils/checkout';
import { getStripeClient } from '../../utils/stripe';

const confirmPaymentSchema = z.object({
  checkoutSessionId: z.string().trim().min(1).max(191),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = confirmPaymentSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Payload conferma pagamento non valido',
      data: parsed.error.format(),
    });
  }

  const checkoutSession = await getCheckoutSessionOrThrow(parsed.data.checkoutSessionId);
  if (!checkoutSession.paymentIntentId) {
    throw createError({
      statusCode: 409,
      message: 'Nessun pagamento associato al checkout',
    });
  }

  if (checkoutSession.status === 'COMPLETED' && checkoutSession.order?.id) {
    return {
      success: true,
      status: 'completed',
      checkout: serializeCheckoutSession(checkoutSession),
      order: checkoutSession.order,
    };
  }

  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    const result = await handleCompletedCheckout({
      checkoutSessionId: checkoutSession.id,
      paymentIntentId: paymentIntent.id,
      requestId: event.context.requestId,
    });

    return {
      success: true,
      status: 'completed',
      checkout: serializeCheckoutSession(result.checkoutSession),
      order: result.order,
    };
  }

  const updatedCheckout = await updateCheckoutFromStripeStatus({
    checkoutSessionId: checkoutSession.id,
    paymentIntentId: paymentIntent.id,
    stripeStatus: paymentIntent.status,
  });

  return {
    success: false,
    status: paymentIntent.status,
    checkout: serializeCheckoutSession(updatedCheckout),
  };
});
