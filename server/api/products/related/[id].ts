import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    console.log(id);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID prodotto mancante'
      });
    }
    
    // Ottieni il prodotto corrente per trovare la categoria e il brand
    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        brand: true,
        gender: true
      }
    });
    
    if (!currentProduct) {
      throw createError({
        statusCode: 404,
        message: 'Prodotto non trovato'
      });
    }
    
    // Trova prodotti correlati basati su categoria, brand o genere
    // Esclude il prodotto corrente e limita a 8 risultati
    const relatedProducts = await prisma.product.findMany({
      where: {
        OR: [
          // Stessa categoria
          { categoryId: currentProduct.categoryId },
          // Stesso brand
          { brandId: currentProduct.brandId },
          // Stesso genere
          { genderId: currentProduct.genderId }
        ],
        // Escludi il prodotto corrente
        NOT: { id: currentProduct.id }
      },
      include: {
        category: true,
        brand: true,
        gender: true
      },
      // Ordina per rilevanza: prima stessa categoria e brand, poi solo stessa categoria
      orderBy: [
        { categoryId: 'asc' },
        { brandId: 'asc' }
      ],
      // Limita a 8 prodotti correlati
      take: 8
    });
    
    // Calcola un punteggio di rilevanza per ogni prodotto correlato
    const scoredProducts = relatedProducts.map(product => {
      let relevanceScore = 0;
      
      // Assegna punteggi in base alla corrispondenza
      if (product.categoryId === currentProduct.categoryId) relevanceScore += 3;
      if (product.brandId === currentProduct.brandId) relevanceScore += 2;
      if (product.genderId === currentProduct.genderId) relevanceScore += 1;
      
      // Aggiungi un piccolo bonus per prodotti in promozione
      if (product.promo) relevanceScore += 0.5;
      
      return {
        ...product,
        relevanceScore
      };
    });
    
    // Ordina per punteggio di rilevanza (dal più alto al più basso)
    scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Rimuovi il campo relevanceScore prima di inviare la risposta
    const result = scoredProducts.map(({ relevanceScore, ...product }) => product);
    
    return result;
    
  } catch (error) {
    console.error('Errore nel recupero dei prodotti correlati:', error);
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei prodotti correlati'
    });
  }
});