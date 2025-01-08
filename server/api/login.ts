import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // Usa la chiave segreta dal file .env

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

    // Genera il token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1m' }  // Scadenza di 1 ora
    );

    // Trova se esiste già un token per questo utente
    const existingToken = await prisma.token.findFirst({
        where: { userId: user.id },
    });

    if (existingToken) {
      // Se esiste, aggiorna il record del token
      await prisma.token.update({
        where: { id: existingToken.id },  // Usa l'id del token esistente per l'aggiornamento
        data: {
          token,  // Aggiorna il token
          expiresAt: new Date(Date.now() + 60 * 1000),  // Imposta una nuova scadenza (1 minuto)
        },
      });
    } else {
      // Se non esiste, crea un nuovo record per il token
      await prisma.token.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 1000), // Scadenza tra 1 ora
        },
      });
    }

    return {
      success: true,
      message: 'Login effettuato con successo',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
      },
      token, // Ritorna il token generato
    };
  }
});
