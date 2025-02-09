import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default defineEventHandler(async (event) => {
  const { amount, currency, description } = await readBody(event);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('Errore durante la creazione del pagamento:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nel processo di pagamento',
    });
  }
});