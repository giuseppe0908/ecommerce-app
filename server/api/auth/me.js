import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const token = event.req.headers['authorization']?.split(' ')[1];

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token mancante' });
  }

  try {
    // Decodifica il token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica che l'utente esista nel database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw createError({ statusCode: 401, message: 'Utente non trovato' });
    }

    // Restituisci i dati dell'utente
    return { id: user.id, name: user.name, role: user.role };

  } catch (error) {
    // Gestione degli errori (token invalido o scaduto)
    throw createError({ statusCode: 401, message: 'Token non valido o scaduto' });
  }
});
