import type { Role } from '@prisma/client';
import type { H3Event } from 'h3';
import { deleteCookie, getCookie, getRequestHeader, setCookie } from 'h3';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { getTokenLookupCandidates, hashOpaqueToken } from './token-security';

export const AUTH_SESSION_COOKIE_NAME = 'auth_session';
export const TOKEN_EXPIRY_SECONDS = 60 * 60;
export const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_SECONDS * 1000;
const SESSION_AUDIENCE = 'ecommerce-app-session';
const SESSION_ISSUER = 'ecommerce-app';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non configurato');
}

export type SessionUserPayload = {
  id: number;
  email: string;
  role: Role;
};

function shouldUseSecureCookies() {
  return process.env.NODE_ENV === 'production';
}

function parseBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function getSessionToken(event: H3Event): string | null {
  const bearerToken = parseBearerToken(getRequestHeader(event, 'authorization'));
  if (bearerToken) {
    return bearerToken;
  }

  const cookieToken = getCookie(event, AUTH_SESSION_COOKIE_NAME);
  return typeof cookieToken === 'string' && cookieToken.trim() ? cookieToken.trim() : null;
}

export function extractUserIdFromDecoded(decoded: string | jwt.JwtPayload): number | null {
  if (typeof decoded === 'string') return null;
  const sub = decoded.sub;
  if (typeof sub !== 'string' && typeof sub !== 'number') return null;
  const userId = Number.parseInt(String(sub), 10);
  return Number.isNaN(userId) ? null : userId;
}

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      audience: SESSION_AUDIENCE,
      issuer: SESSION_ISSUER,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'JsonWebTokenError' &&
      /audience|issuer/i.test(error.message)
    ) {
      // Backward compatibility for session tokens issued before audience/issuer hardening.
      return jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      });
    }

    throw error;
  }
}

export function signSessionToken(user: SessionUserPayload): string {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      audience: SESSION_AUDIENCE,
      expiresIn: TOKEN_EXPIRY_SECONDS,
      issuer: SESSION_ISSUER,
    }
  );
}

export function setSessionCookie(event: H3Event, token: string) {
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  setCookie(event, AUTH_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    path: '/',
    maxAge: TOKEN_EXPIRY_SECONDS,
    expires: expiresAt,
  });
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, AUTH_SESSION_COOKIE_NAME, {
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    path: '/',
  });
}

export async function issueUserSession(event: H3Event, user: SessionUserPayload) {
  const token = signSessionToken(user);
  const hashedToken = hashOpaqueToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.$transaction([
    prisma.token.deleteMany({ where: { userId: user.id } }),
    prisma.token.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    }),
  ]);

  setSessionCookie(event, token);
  return { token, expiresAt };
}

export async function revokeUserSession(userId: number, token?: string) {
  await prisma.token.deleteMany({
    where: {
      userId,
      ...(token ? { token: { in: getTokenLookupCandidates(token) } } : {}),
    },
  });
}
