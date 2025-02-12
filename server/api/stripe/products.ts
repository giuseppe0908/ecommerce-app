import Stripe from 'stripe';
import dotenv from 'dotenv';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  dotenv.config();

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
  
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2022-11-15',
  });

  try {
    const products = await stripe.products.list({
      limit: 100,
      active: true,
      expand: ['data.default_price']
    });

    // const formattedProducts = products.data.map(product => {
    //   const price = product.default_price as Stripe.Price;
    //   return {
    //     id: product.id,
    //     name: product.name,
    //     description: product.description,
    //     images: product.images,
    //     price: price ? price.unit_amount ? price.unit_amount / 100 : null : null,
    //     currency: price?.currency || 'eur',
    //     metadata: product.metadata
    //   };
    // });

    // return {
    //   success: true,
    //   products: formattedProducts
    // };
    return products;
  } catch (error) {
    console.error('Errore nel recupero dei prodotti:', error);
    return {
      success: false,
      error: 'Errore nel recupero dei prodotti'
    };
  }
});