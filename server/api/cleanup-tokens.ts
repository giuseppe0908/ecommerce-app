import { PrismaClient } from '@prisma/client';
import { H3Event } from 'h3';

const prisma = new PrismaClient();

/**
 * Endpoint per la pulizia dei token scaduti
 * Può essere chiamato manualmente o tramite un job schedulato
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    // Ottieni la data corrente
    const currentDate = new Date();
    
    // Elimina tutti i token scaduti
    const deletedTokens = await prisma.token.deleteMany({
      where: {
        expiresAt: {
          lt: currentDate // Trova tutti i token con data di scadenza minore della data corrente
        }
      }
    });
    
    // Elimina anche i token di reset scaduti
    const deletedResetTokens = await prisma.resetToken.deleteMany({
      where: {
        expiresAt: {
          lt: currentDate
        }
      }
    });
    
    console.log(`Pulizia completata: ${deletedTokens.count} token di autenticazione e ${deletedResetTokens.count} token di reset eliminati`);
    
    return {
      success: true,
      message: 'Pulizia token completata',
      deletedTokens: deletedTokens.count,
      deletedResetTokens: deletedResetTokens.count
    };
  } catch (error) {
    console.error('Errore durante la pulizia dei token:', error);
    
    throw createError({
      statusCode: 500,
      message: 'Errore durante la pulizia dei token'
    });
  }
});