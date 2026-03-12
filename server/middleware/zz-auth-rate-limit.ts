import { defineEventHandler } from 'h3';
import { enforceRateLimit } from '../utils/rate-limit';

type RateLimitRule = {
  path: string;
  method: string;
  namespace: string;
  maxRequests: number;
  windowMs: number;
  message: string;
};

const RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    path: '/api/login',
    method: 'POST',
    namespace: 'auth-login',
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
    message: 'Troppi tentativi di login. Riprova tra qualche minuto.',
  },
  {
    path: '/api/auth/register',
    method: 'POST',
    namespace: 'auth-register',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Troppi tentativi di registrazione. Riprova più tardi.',
  },
  {
    path: '/api/auth/forgot-password',
    method: 'POST',
    namespace: 'auth-forgot-password',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Troppi tentativi di reset password. Riprova più tardi.',
  },
  {
    path: '/api/auth/reset-password',
    method: 'POST',
    namespace: 'auth-reset-password',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Troppi tentativi di reset password. Riprova più tardi.',
  },
  {
    path: '/api/auth/github',
    method: 'GET',
    namespace: 'auth-github',
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
    message: 'Troppi tentativi di login GitHub. Riprova più tardi.',
  },
  {
    path: '/api/auth/github/callback',
    method: 'GET',
    namespace: 'auth-github-callback',
    maxRequests: 15,
    windowMs: 10 * 60 * 1000,
    message: 'Troppi tentativi di callback GitHub. Riprova più tardi.',
  },
  {
    path: '/api/refresh-token',
    method: 'POST',
    namespace: 'auth-refresh-token',
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
    message: 'Troppi tentativi di refresh sessione. Riprova più tardi.',
  },
];

function normalizePath(url: string | undefined) {
  return (url || '/').split('?')[0] || '/';
}

export default defineEventHandler(async (event) => {
  const method = String(event.node.req.method || 'GET').toUpperCase();
  const path = normalizePath(event.node.req.url);

  const matchedRule = RATE_LIMIT_RULES.find(
    (rule) => rule.method === method && rule.path === path
  );

  if (!matchedRule) {
    return;
  }

  await enforceRateLimit(event, matchedRule);
});
