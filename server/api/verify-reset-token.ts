import { PrismaClient } from '@prisma/client';
import { H3Event, createError } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event);
    const { token } = body;
    
    // Validate token parameter
    if (!token || typeof token !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Token non fornito o non valido'
      });
    }

    // Find token in database
    const resetToken = await prisma.resetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    // Check if token exists
    if (!resetToken) {
      throw createError({
        statusCode: 404,
        message: 'Token non trovato'
      });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.resetToken.delete({
        where: { id: resetToken.id }
      });
      
      throw createError({
        statusCode: 400,
        message: 'Token scaduto'
      });
    }

    return {
      success: true,
      data: {
        valid: true,
        userId: resetToken.userId,
        email: resetToken.user.email
      }
    };

  } catch (error) {
    console.error('Error verifying reset token:', error);
    
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: 'Errore interno del server'
    });
  }
});