import { createLogger } from '../../utils/observability';
import prisma from '../../utils/prisma';

const logger = createLogger('reviews-list');

export default defineEventHandler(async (event) => {
  try {
    const productIdParam = event.context.params?.productId;
    const productId = Number.parseInt(String(productIdParam || ''), 10);

    if (!productIdParam || Number.isNaN(productId) || productId <= 0) {
      throw createError({
        statusCode: 400,
        message: 'ID prodotto mancante'
      });
    }
    
    // Verifica che il prodotto esista
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Prodotto non trovato'
      });
    }
    
    // Fetch reviews for this product
    const reviews = await prisma.review.findMany({
      where: {
        productId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true
          }
        }
      },
      orderBy: {
        createdAt: "desc" // Now we can use createdAt
      }
    });
    
    return reviews;
    
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode) {
      throw error;
    }

    logger.error('Errore nel recupero delle recensioni', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero delle recensioni'
    });
  }
});
