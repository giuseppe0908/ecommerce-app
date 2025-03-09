import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {  
    // Ottieni il token dall'header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {

      throw createError({
        statusCode: 401,
        message: 'Token non fornito'
      })
    }

    const token = authHeader.split(' ')[1]
    
    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number }

    // Trova l'utente nel database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Utente non trovato'
      })
    }

    // Restituisci i dati dell'utente
    return {
      user,
      verified: true
    }

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        message: 'Token non valido'
      })
    }

    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        message: 'Token scaduto'
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Errore interno del server'
    })
  }
})