import type { H3Event } from 'h3';
import { createError, getRequestHeader, setHeader } from 'h3';
import { buildCacheKey, getCache, setCache } from './cache';
import { createLogger } from './observability';

type RateLimitOptions = {
  namespace: string;
  maxRequests: number;
  windowMs: number;
  key?: string;
  message?: string;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const logger = createLogger('rate-limit');

function getClientIp(event: H3Event) {
  const forwardedFor = getRequestHeader(event, 'x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  return (
    getRequestHeader(event, 'cf-connecting-ip') ||
    getRequestHeader(event, 'x-real-ip') ||
    event.node.req.socket?.remoteAddress ||
    'unknown'
  );
}

export function getRateLimitKey(event: H3Event, namespace: string, customKey?: string) {
  return buildCacheKey(`ratelimit:${namespace}`, customKey || getClientIp(event));
}

export async function enforceRateLimit(event: H3Event, options: RateLimitOptions) {
  const now = Date.now();
  const cacheKey = getRateLimitKey(event, options.namespace, options.key);
  const cachedState = await getCache<RateLimitState>(cacheKey);

  let state =
    cachedState.hit && cachedState.value.resetAt > now
      ? cachedState.value
      : {
          count: 0,
          resetAt: now + options.windowMs,
        };

  state = {
    ...state,
    count: state.count + 1,
  };

  const retryAfterSeconds = Math.max(1, Math.ceil((state.resetAt - now) / 1000));
  await setCache(cacheKey, state, retryAfterSeconds);

  setHeader(event, 'x-ratelimit-limit', String(options.maxRequests));
  setHeader(event, 'x-ratelimit-remaining', String(Math.max(options.maxRequests - state.count, 0)));
  setHeader(event, 'x-ratelimit-reset', String(Math.ceil(state.resetAt / 1000)));

  if (state.count <= options.maxRequests) {
    return;
  }

  setHeader(event, 'retry-after', retryAfterSeconds);
  logger.warn('Rate limit superato', {
    requestId: event.context.requestId,
    namespace: options.namespace,
    key: options.key || getClientIp(event),
    maxRequests: options.maxRequests,
    windowMs: options.windowMs,
  });

  throw createError({
    statusCode: 429,
    message: options.message || 'Troppi tentativi. Riprova più tardi.',
  });
}
