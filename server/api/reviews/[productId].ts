import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const productId = event.context.params?.productId;
    
    if (!productId) {
      throw createError({
        statusCode: 400,
        message: 'ID prodotto mancante'
      });
    }
    
    // Verifica che il prodotto esista
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
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
        productId: parseInt(productId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc" // Now we can use createdAt
      }
    });
    
    return reviews;
    
  } catch (error) {
    console.error('Errore nel recupero delle recensioni:', error);
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero delle recensioni'
    });
  }
});