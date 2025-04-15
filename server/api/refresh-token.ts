import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const TOKEN_EXPIRY = '1h' // Token expires in 1 hour

export default defineEventHandler(async (event) => {
  try {
    // Get the authorization header
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Token di autenticazione mancante o non valido'
      })
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1]
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true })
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Utente non trovato'
      })
    }
    
    // Generate a new token
    const newToken = jwt.sign(
      { 
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
      },
      JWT_SECRET
    )
    
    return { token: newToken }
    
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw createError({
      statusCode: 401,
      message: 'Impossibile aggiornare il token'
    })
  }
})