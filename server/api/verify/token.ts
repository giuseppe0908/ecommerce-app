import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non configurato');
}

export default defineEventHandler(async (event) => {
  try {
    // Ottieni l'header di autorizzazione
    const authHeader = getRequestHeader(event, 'authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Token di autorizzazione mancante o non valido'
      });
    }

    // Estrai il token
    const token = authHeader.split(' ')[1];

    try {
      // Verifica il token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Controlla se il token è scaduto
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        // Elimina il token scaduto dal database
        await prisma.token.deleteMany({
          where: {
            userId: decoded.sub,
            expiresAt: {
              lt: new Date() // Trova tutti i token scaduti per questo utente
            }
          }
        });
        
        throw createError({
          statusCode: 401,
          message: 'Token scaduto'
        });
      }

      // Verifica che l'utente esista
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub }
      });

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Utente non trovato'
        });
      }

      // Token valido
      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Errore nella verifica del token:', error);
      throw createError({
        statusCode: 401,
        message: 'Token non valido o scaduto'
      });
    }
  } catch (error) {
    console.error('Errore generale:', error);
    throw createError({
      statusCode: 500,
      message: 'Errore interno del server'
    });
  }
});