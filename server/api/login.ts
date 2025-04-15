import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non configurato');
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'POST') {
    const body = await readBody(event);
    const { email, password } = body;

    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError({ statusCode: 401, message: 'Email errata' });
    }

    // Verifica la password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw createError({ statusCode: 401, message: 'Credenziali errate' });
    }

    // Genera il token JWT con payload minimale per ridurre la dimensione
    const token = jwt.sign(
      { 
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
      },
      JWT_SECRET
    );

    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 ore in millisecondi
    
    try {
      // Trova se esiste già un token per questo utente
      const existingToken = await prisma.token.findFirst({
        where: { userId: user.id },
      });

      if (existingToken) {
        // Se esiste, aggiorna il record del token
        await prisma.token.update({
          where: { id: existingToken.id },
          data: {
            token,
            expiresAt: new Date(Date.now() + ONE_DAY),
          },
        });
      } else {
        // Se non esiste, crea un nuovo record per il token
        await prisma.token.create({
          data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + ONE_DAY),
          },
        });
      }
    } catch (error) {
      console.error('Errore nel salvataggio del token:', error);
      // Continua comunque, anche se non riusciamo a salvare il token nel DB
      // L'utente potrà comunque usare il token restituito
    }

    return {
      success: true,
      message: 'Login effettuato con successo',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
      token, // Ritorna il token generato
    };
  }
});
