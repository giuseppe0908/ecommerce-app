import { PrismaClient } from '@prisma/client';
import { defineEventHandler, readBody, createError, getQuery } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  
  // GET - Ottieni i preferiti di un utente
  if (method === 'GET') {
    const query = getQuery(event);
    const userId = parseInt(query.userId as string, 10);
    
    if (!userId) {
      throw createError({ statusCode: 400, message: 'ID utente richiesto' });
    }
    
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              gender: true // Includi anche le informazioni sul genere
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return favorites;
    } catch (error) {
      console.error('Errore nel recupero dei preferiti:', error);
      throw createError({ statusCode: 500, message: 'Errore nel recupero dei preferiti' });
    }
  }
  
  // POST - Aggiungi un prodotto ai preferiti
  else if (method === 'POST') {
    const body = await readBody(event);
    console.log(body);
    
    const { userId, productId } = body;
    
    if (!userId || !productId) {
      throw createError({ statusCode: 400, message: 'ID utente e ID prodotto richiesti' });
    }
    
    try {
      // Verifica se il preferito esiste già
      const existingFavorite = await prisma.favorite.findFirst({
        where: {
          userId: parseInt(userId, 10),
          productId: parseInt(productId, 10)
        }
      });
      
      if (existingFavorite) {
        return { message: 'Prodotto già nei preferiti', favorite: existingFavorite };
      }
      
      // Crea un nuovo preferito
      const favorite = await prisma.favorite.create({
        data: {
          userId: parseInt(userId, 10),
          productId: parseInt(productId, 10)
        },
        include: {
          product: {
            include: {
              brand: true,
              category: true
            }
          }
        }
      });
      
      return { message: 'Prodotto aggiunto ai preferiti', favorite };
    } catch (error) {
      console.error('Errore nell\'aggiunta ai preferiti:', error);
      throw createError({ statusCode: 500, message: 'Errore nell\'aggiunta ai preferiti' });
    }
  }
  
  // DELETE - Rimuovi un prodotto dai preferiti
  else if (method === 'DELETE') {
    const body = await readBody(event);
    const { userId, productId, clearAll } = body;
    
    // Se clearAll è true, elimina tutti i preferiti dell'utente
    if (clearAll && userId) {
      try {
        await prisma.favorite.deleteMany({
          where: { userId: parseInt(userId, 10) }
        });
        
        return { message: 'Tutti i preferiti rimossi con successo' };
      } catch (error) {
        console.error('Errore nella rimozione di tutti i preferiti:', error);
        throw createError({ statusCode: 500, message: 'Errore nella rimozione di tutti i preferiti' });
      }
    }
    
    // Altrimenti, rimuovi un singolo prodotto dai preferiti
    if (!userId || !productId) {
      throw createError({ statusCode: 400, message: 'ID utente e ID prodotto richiesti' });
    }
    
    try {
      await prisma.favorite.deleteMany({
        where: {
          userId: parseInt(userId, 10),
          productId: parseInt(productId, 10)
        }
      });
      
      return { message: 'Prodotto rimosso dai preferiti' };
    } catch (error) {
      console.error('Errore nella rimozione dai preferiti:', error);
      throw createError({ statusCode: 500, message: 'Errore nella rimozione dai preferiti' });
    }
  }
  
  // Metodo non supportato
  else {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }
});