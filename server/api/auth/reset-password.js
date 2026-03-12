import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createLogger } from '../../utils/observability';
import prisma from '../../utils/prisma';
import { getTokenLookupCandidates } from '../../utils/token-security';

const MIN_PASSWORD_LENGTH = 8;
const logger = createLogger('auth-reset-password');
const resetPasswordBodySchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(128),
});

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  try {
    const body = await readBody(event);
    const parsedBody = resetPasswordBodySchema.safeParse(body);
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload reset password non valido',
        data: parsedBody.error.format(),
      });
    }
    const { token, password } = parsedBody.data;

    const tokenCandidates = getTokenLookupCandidates(token);
    const resetToken = await prisma.resetToken.findFirst({
      where: {
        token: { in: tokenCandidates },
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      throw createError({
        statusCode: 400,
        message: 'Token non valido o scaduto',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: resetToken.userId,
      },
      select: {
        password: true,
      },
    });

    if (existingUser?.password) {
      const isSamePassword = await bcrypt.compare(password, existingUser.password);
      if (isSamePassword) {
        throw createError({
          statusCode: 400,
          message: 'La nuova password deve essere diversa da quella attuale',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),
      prisma.resetToken.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
      prisma.token.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Password aggiornata con successo',
    };
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore reset-password', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore durante il reset della password',
    });
  }
});
