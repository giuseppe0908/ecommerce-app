import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  console.log(query);
  
  // Costruisci il filtro di prezzo in modo più flessibile
  let priceFilter = {};
  if (query.priceMin) {
    priceFilter = { ...priceFilter, gte: parseFloat(query.priceMin as string) };
  }
  if (query.priceMax) {
    priceFilter = { ...priceFilter, lte: parseFloat(query.priceMax as string) };
  }

  
  const filters = {
    ...(query.category && !isNaN(parseInt(query.category as string, 10)) && { categoryId: parseInt(query.category as string, 10) }),
    ...(query.brand && !isNaN(parseInt(query.brand as string, 10)) && { brandId: parseInt(query.brand as string, 10) }),
    ...(query.gender && !isNaN(parseInt(query.gender as string, 10)) && { genderId: parseInt(query.gender as string, 10) }),
    ...(query.newArrivals === 'true' && { newArrival: true }),
    ...(query.promo && !isNaN(parseInt(query.promo as string, 10)) && { promoId: parseInt(query.promo as string, 10) }),
    ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
  };
  
  // Rimuovi il log problematico che causa l'errore
  
  const method = event.node.req.method;
    if (method === 'GET') {
      // Verifica se i filtri sono vuoti
      const products = Object.keys(filters).length === 0
      ? await prisma.product.findMany({
          include: {
            category: true,
            brand: true,
            gender: true,
          },
        })
      : await prisma.product.findMany({
          where: filters,
          include: {
            category: true,
            brand: true,
            gender: true,
          },
        });    
        return products
        
    }
    else if(method === 'POST') {
        const body = await readBody(event)
         // Legge il body della richiesta
        const newProduct = await prisma.product.create({
            data: body,
        })
        return newProduct
        
    }
    else if (method === 'DELETE') {
      const { id } = await readBody(event);  // Prendi solo l'id dal body
      try {
          await prisma.product.delete({
            where: { id },
          });
          return { success: true };
      }catch (error) {
        console.error('Error deleting product:', error);
        throw createError({ statusCode: 500, statusMessage: 'Error deleting product' });
      }
    } else {
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }
  });
