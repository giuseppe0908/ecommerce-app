import { Role } from '@prisma/client';
import type { H3Event } from 'h3';
import { createError } from 'h3';
import { createLogger } from './observability';
import prisma from './prisma';
import {
  clearSessionCookie,
  extractUserIdFromDecoded,
  getSessionToken,
  verifySessionToken,
} from './session';
import { getTokenLookupCandidates } from './token-security';

const logger = createLogger('auth-session');

export type AuthenticatedUser = {
  id: number;
  role: Role;
  name: string | null;
  surname: string | null;
  email: string;
  address: string | null;
  number: string | null;
  token: string;
};

type AuthOptions = {
  requiredRole?: Role;
};

function rejectUnauthorized(event: H3Event, message: string) {
  clearSessionCookie(event);
  throw createError({ statusCode: 401, message });
}

export async function requireAuthenticatedUser(
  event: H3Event,
  options: AuthOptions = {}
): Promise<AuthenticatedUser> {
  const token = getSessionToken(event);
  if (!token) {
    rejectUnauthorized(event, 'Token di autorizzazione mancante o non valido');
  }

  let userId: number | null = null;
  try {
    const decoded = verifySessionToken(token);
    userId = extractUserIdFromDecoded(decoded);
  } catch (error) {
    const jwtErrorNames = ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'];
    if (error instanceof Error && jwtErrorNames.includes(error.name)) {
      rejectUnauthorized(event, 'Token non valido o scaduto');
    }

    logger.error('Errore verifica token', {
      requestId: event.context.requestId,
      error,
    });
    throw createError({ statusCode: 500, message: 'Errore interno del server' });
  }

  if (!userId) {
    rejectUnauthorized(event, 'Token non valido');
  }

  const [activeToken, user] = await Promise.all([
    prisma.token.findFirst({
      where: {
        userId,
        token: { in: getTokenLookupCandidates(token) },
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        name: true,
        surname: true,
        email: true,
        address: true,
        number: true,
      },
    }),
  ]);

  if (!activeToken) {
    rejectUnauthorized(event, 'Sessione non valida o revocata');
  }

  if (!user) {
    rejectUnauthorized(event, 'Utente non trovato');
  }

  if (options.requiredRole && user.role !== options.requiredRole) {
    throw createError({ statusCode: 403, message: 'Permessi insufficienti' });
  }

  const authUser: AuthenticatedUser = {
    id: user.id,
    role: user.role,
    name: user.name,
    surname: user.surname,
    email: user.email,
    address: user.address,
    number: user.number,
    token,
  };

  (event.context as { authUser?: AuthenticatedUser }).authUser = authUser;
  return authUser;
}

export function requireAdminUser(event: H3Event): Promise<AuthenticatedUser> {
  return requireAuthenticatedUser(event, { requiredRole: Role.ADMIN });
}
