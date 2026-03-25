import { H3Event, createError } from 'h3';
import { z } from 'zod';
import { createLogger } from '../utils/observability';
import prisma from '../utils/prisma';
import { getTokenLookupCandidates } from '../utils/token-security';

const verifyResetTokenSchema = z.object({
  token: z.string().trim().min(1),
});
const logger = createLogger('auth-verify-reset-token');

export default defineEventHandler(async (event: H3Event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  try {
    const body = await readBody(event);
    const parsedBody = verifyResetTokenSchema.safeParse(body);
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload token non valido',
        data: parsedBody.error.format(),
      });
    }
    const { token } = parsedBody.data;

    const tokenCandidates = getTokenLookupCandidates(token);
    const resetToken = await prisma.resetToken.findFirst({
      where: { token: { in: tokenCandidates } },
    });

    if (!resetToken) {
      throw createError({
        statusCode: 400,
        message: 'Token non valido o scaduto',
      });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.resetToken.delete({
        where: { id: resetToken.id },
      });

      throw createError({
        statusCode: 400,
        message: 'Token non valido o scaduto',
      });
    }

    return {
      success: true,
      data: {
        valid: true,
      },
    };
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode) {
      throw error;
    }

    logger.error('Errore verifica reset token', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore interno del server'
    });
  }
});
