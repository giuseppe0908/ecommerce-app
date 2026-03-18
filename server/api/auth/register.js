import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createLogger } from '../../utils/observability';
import prisma from '../../utils/prisma';

const MIN_PASSWORD_LENGTH = 8;
const logger = createLogger('auth-register');
const registerBodySchema = z.object({
  name: z.string().trim().max(100).optional(),
  surname: z.string().trim().max(100).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(128),
  role: z.string().trim().optional(),
  address: z.string().trim().max(255).optional(),
  number: z.string().trim().max(50).optional(),
});

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  try {
    const body = await readBody(event);
    const parsedBody = registerBodySchema.safeParse(body);
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload registrazione non valido',
        data: parsedBody.error.format(),
      });
    }

    const {
      name,
      surname,
      email: normalizedEmail,
      password,
      role,
      address,
      number,
    } = parsedBody.data;

    if (role && String(role).toUpperCase() !== 'USER') {
      throw createError({
        statusCode: 403,
        message: 'Impostazione ruolo non consentita in registrazione pubblica',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw createError({ statusCode: 409, message: 'Email già registrata' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        surname: surname || null,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
        address: address || null,
        number: number || null,
      },
    });

    return {
      message: 'Registrazione completata',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        address: user.address,
        number: user.number,
      },
    };
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore registrazione utente', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore interno durante la registrazione',
    });
  }
});
