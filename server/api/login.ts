import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createLogger } from '../utils/observability';
import prisma from '../utils/prisma';
import { issueUserSession } from '../utils/session';

const logger = createLogger('auth-login');
const loginBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  const body = await readBody(event);
  const parsedBody = loginBodySchema.safeParse(body);
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: 'Payload login non valido',
      data: parsedBody.error.format(),
    });
  }
  const { email, password } = parsedBody.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Evita enumeration: stesso errore per utente inesistente o password errata.
  if (!user || !user.password) {
    throw createError({ statusCode: 401, message: 'Credenziali errate' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw createError({ statusCode: 401, message: 'Credenziali errate' });
  }

  try {
    const { token } = await issueUserSession(event, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: 'Login effettuato con successo',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        address: user.address,
        number: user.number,
      },
      token,
    };
  } catch (error) {
    logger.error('Errore nel salvataggio del token', {
      requestId: event.context.requestId,
      error,
      userId: user.id,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore interno durante la creazione della sessione',
    });
  }
});
