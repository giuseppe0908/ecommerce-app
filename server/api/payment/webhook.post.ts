import type Stripe from 'stripe';
import { getRequestHeader, readRawBody } from 'h3';
import {
  handleCompletedCheckout,
  updateCheckoutFromStripeStatus,
} from '../../utils/checkout';
import { createLogger } from '../../utils/observability';
import { getStripeClient, getStripeWebhookSecret } from '../../utils/stripe';

const logger = createLogger('payment-webhook');

export default defineEventHandler(async (event) => {
  const signature = getRequestHeader(event, 'stripe-signature');
  if (!signature) {
    throw createError({ statusCode: 400, message: 'Stripe signature mancante' });
  }

  const rawBody = await readRawBody(event, false);
  if (!rawBody) {
    throw createError({ statusCode: 400, message: 'Payload webhook mancante' });
  }

  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: 'Webhook Stripe non valido',
      data: error instanceof Error ? error.message : String(error),
    });
  }

  if (!stripeEvent.data?.object || !('id' in stripeEvent.data.object)) {
    return { received: true };
  }

  if (stripeEvent.data.object.object !== 'payment_intent') {
    return { received: true };
  }

  const paymentIntent: Stripe.PaymentIntent = stripeEvent.data.object;
  const checkoutSessionId =
    typeof paymentIntent.metadata?.checkoutSessionId === 'string'
      ? paymentIntent.metadata.checkoutSessionId
      : null;

  if (!checkoutSessionId) {
    return { received: true };
  }

  try {
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handleCompletedCheckout({
          checkoutSessionId,
          paymentIntentId: paymentIntent.id,
          requestId: event.context.requestId,
        });
        break;
      case 'payment_intent.payment_failed':
        await updateCheckoutFromStripeStatus({
          checkoutSessionId,
          paymentIntentId: paymentIntent.id,
          stripeStatus: 'payment_failed',
        });
        break;
      case 'payment_intent.canceled':
      case 'payment_intent.processing':
      case 'payment_intent.requires_action':
        await updateCheckoutFromStripeStatus({
          checkoutSessionId,
          paymentIntentId: paymentIntent.id,
          stripeStatus: paymentIntent.status,
        });
        break;
      default:
        break;
    }
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode)
        : NaN;

    if (statusCode === 404 || statusCode === 409 || statusCode === 410) {
      logger.warn('Webhook Stripe ignorato per checkout non finalizzabile', {
        requestId: event.context.requestId,
        checkoutSessionId,
        paymentIntentId: paymentIntent.id,
        stripeEventType: stripeEvent.type,
        statusCode,
        error,
      });
      return { received: true, ignored: true };
    }

    throw error;
  }

  return { received: true };
});
