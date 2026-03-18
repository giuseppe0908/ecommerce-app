import { createError } from 'h3';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw createError({
      statusCode: 500,
      message: 'STRIPE_SECRET_KEY non configurata',
    });
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey);
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw createError({
      statusCode: 500,
      message: 'STRIPE_WEBHOOK_SECRET non configurata',
    });
  }

  return webhookSecret;
}
