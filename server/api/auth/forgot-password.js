import nodemailer from 'nodemailer';
import { getRequestURL } from 'h3';
import { z } from 'zod';
import { createLogger } from '../../utils/observability';
import prisma from '../../utils/prisma';
import { createOpaqueToken } from '../../utils/token-security';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 ora
const MIN_RESPONSE_MS = 500; // Mitiga differenze di timing tra email esistenti/non esistenti
const GENERIC_RESET_MESSAGE = 'Se l\'email esiste, riceverai un link per reimpostare la password.';
const logger = createLogger('auth-forgot-password');
const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildResetLink(event, token) {
  const config = useRuntimeConfig(event);
  const configuredBaseUrl = (config.public?.appBaseUrl || process.env.APP_BASE_URL || '').trim();
  const origin = configuredBaseUrl || getRequestURL(event).origin;
  const normalizedOrigin = origin.replace(/\/+$/, '');
  return `${normalizedOrigin}/reset-password?token=${encodeURIComponent(token)}`;
}

async function sendResetEmail(toEmail, resetLink) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER o EMAIL_PASS non configurati');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: emailUser,
    to: toEmail,
    subject: 'Reset Password',
    html: `
      <p>Clicca sul link seguente per reimpostare la tua password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Il link scadrà tra 1 ora.</p>
    `,
  });
}

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  const startedAt = Date.now();
  const ensureMinResponseTime = async () => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_RESPONSE_MS) {
      await sleep(MIN_RESPONSE_MS - elapsed);
    }
  };

  try {
    const body = await readBody(event);
    const parsedBody = forgotPasswordBodySchema.safeParse(body);
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload reset password non valido',
        data: parsedBody.error.format(),
      });
    }
    const email = parsedBody.data.email;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      try {
        const { token, tokenHash } = createOpaqueToken();
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
        const resetLink = buildResetLink(event, token);

        await prisma.$transaction([
          prisma.resetToken.deleteMany({ where: { userId: user.id } }),
          prisma.resetToken.create({
            data: {
              userId: user.id,
              token: tokenHash,
              expiresAt,
            },
          }),
        ]);

        await sendResetEmail(email, resetLink);
      } catch (error) {
        logger.error('Errore generazione o invio reset password', {
          requestId: event.context.requestId,
          error,
          userId: user.id,
          email,
        });
      }
    }

    await ensureMinResponseTime();
    return {
      success: true,
      message: GENERIC_RESET_MESSAGE,
    };
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore forgot-password', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore durante il processo di reset password',
    });
  }
});
