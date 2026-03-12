import { z } from 'zod';
import {
  buildPaymentIntentIdempotencyKey,
  getCheckoutSessionOrThrow,
  handleCompletedCheckout,
  serializeCheckoutSession,
  updateCheckoutFromStripeStatus,
} from '../utils/checkout';
import { getStripeClient } from '../utils/stripe';

const paymentSchema = z.object({
  checkoutSessionId: z.string().trim().min(1).max(191),
});

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  const body = await readBody(event);
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Dati pagamento non validi',
      data: parsed.error.format(),
    });
  }

  const stripe = getStripeClient();
  const checkoutSession = await getCheckoutSessionOrThrow(parsed.data.checkoutSessionId);

  if (checkoutSession.status === 'COMPLETED' && checkoutSession.order?.id) {
    return {
      success: true,
      status: 'completed',
      checkout: serializeCheckoutSession(checkoutSession),
      order: checkoutSession.order,
    };
  }

  let paymentIntent = null;
  let createNewPaymentIntent = !checkoutSession.paymentIntentId;

  if (checkoutSession.paymentIntentId) {
    paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.paymentIntentId);

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

    if (paymentIntent.status === 'canceled') {
      createNewPaymentIntent = true;
    } else {
      const updatedCheckout = await updateCheckoutFromStripeStatus({
        checkoutSessionId: checkoutSession.id,
        paymentIntentId: paymentIntent.id,
        stripeStatus: paymentIntent.status,
      });

      return {
        success: true,
        status: 'requires_confirmation',
        clientSecret: paymentIntent.client_secret,
        checkout: serializeCheckoutSession(updatedCheckout),
      };
    }
  }

  if (createNewPaymentIntent) {
    const amount = Math.round(checkoutSession.totalAmount * 100);
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: checkoutSession.currency,
        description: `Checkout ${checkoutSession.id}`,
        metadata: {
          checkoutSessionId: checkoutSession.id,
          customerEmail: checkoutSession.customerEmail,
        },
      },
      {
        idempotencyKey: buildPaymentIntentIdempotencyKey(
          checkoutSession.id,
          checkoutSession.paymentIntentId
        ),
      }
    );

    const updatedCheckout = await updateCheckoutFromStripeStatus({
      checkoutSessionId: checkoutSession.id,
      paymentIntentId: paymentIntent.id,
      stripeStatus: paymentIntent.status,
    });

    return {
      success: true,
      status: 'requires_confirmation',
      clientSecret: paymentIntent.client_secret,
      checkout: serializeCheckoutSession(updatedCheckout),
    };
  }

  throw createError({
    statusCode: 409,
    message: 'Impossibile inizializzare il pagamento per questo checkout',
  });
});
