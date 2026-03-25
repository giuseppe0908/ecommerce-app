import Stripe from 'stripe';
import dotenv from 'dotenv';
import { defineEventHandler } from 'h3';
import NodeCache from 'node-cache';
import { createLogger } from '../../utils/observability';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const cache = new NodeCache({ stdTTL: 600 }); // Cache con TTL di 10 minuti
const logger = createLogger('stripe-products');

export default defineEventHandler(async (event) => {
  const cacheKey = 'productsWithPrices';
  const cachedProducts = cache.get(cacheKey);

  if (cachedProducts) {
    return {
      success: true,
      products: cachedProducts,
    };
  }

  try {
    // Prima recupera i prodotti
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    });

    // Poi recupera i prezzi per ogni prodotto
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          limit: 1,
        });
        
        const price = prices.data[0];
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          price: price ? price.unit_amount! / 100 : null,
          currency: price?.currency || 'eur',
          priceId: price?.id,
          metadata: product.metadata
        };
      })
    );

    cache.set(cacheKey, productsWithPrices); // Memorizza i prodotti nella cache

    return {
      success: true,
      products: productsWithPrices
    };
  } catch (error) {
    logger.error('Errore nel recupero dei prodotti Stripe', {
      requestId: event.context.requestId,
      error,
    });
    return {
      success: false,
      error: 'Errore nel recupero dei prodotti'
    };
  }
});
