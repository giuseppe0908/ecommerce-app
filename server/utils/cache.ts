import NodeCache from 'node-cache';
import { createHash } from 'node:crypto';
import { createLogger } from './observability';

type CacheProvider = 'redis' | 'memory' | 'none';

type CacheHit<T> = {
  hit: true;
  value: T;
  provider: Exclude<CacheProvider, 'none'>;
};

type CacheMiss = {
  hit: false;
  provider: 'none';
};

type CacheResult<T> = CacheHit<T> | CacheMiss;

type RedisDriver = {
  get: (key: string) => Promise<string | null>;
  setEx: (key: string, ttlSeconds: number, value: string) => Promise<void>;
  del: (keys: string[]) => Promise<void>;
  keysByPattern: (pattern: string) => Promise<string[]>;
};

const logger = createLogger('cache');
const memoryCache = new NodeCache({
  useClones: false,
});
const DEFAULT_TTL_SECONDS = 60;
// Optional Redis: enabled only when REDIS_URL/CACHE_REDIS_URL is set and
// a supported client package (`ioredis` or `redis`) is available.
const REDIS_URL = process.env.REDIS_URL || process.env.CACHE_REDIS_URL || '';

let redisDriver: RedisDriver | null | undefined;
let redisInitLogged = false;
let redisFallbackLogged = false;

function dynamicImport(moduleName: string): Promise<any> {
  const importer = new Function('moduleName', 'return import(moduleName)');
  return importer(moduleName) as Promise<any>;
}

function normalizeForStableJson(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeForStableJson(entry));
  }

  if (value && typeof value === 'object') {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => [key, normalizeForStableJson(entryValue)]);
    return Object.fromEntries(sortedEntries);
  }

  return value;
}

function stableJsonStringify(value: unknown): string {
  return JSON.stringify(normalizeForStableJson(value));
}

function logRedisFallbackOnce(message: string, error: unknown) {
  if (redisFallbackLogged) return;
  redisFallbackLogged = true;
  logger.warn(message, { error });
}

async function createRedisDriverFromIoredis(redisUrl: string): Promise<RedisDriver | null> {
  try {
    const module = await dynamicImport('ioredis');
    const RedisConstructor = module?.default || module?.Redis;
    if (typeof RedisConstructor !== 'function') return null;

    const client = new RedisConstructor(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 1200,
      enableReadyCheck: true,
    });

    if (typeof client.connect === 'function') {
      await client.connect();
    }
    await client.ping();

    return {
      get: (key: string) => client.get(key),
      setEx: async (key: string, ttlSeconds: number, value: string) => {
        await client.set(key, value, 'EX', ttlSeconds);
      },
      del: async (keys: string[]) => {
        if (keys.length === 0) return;
        await client.del(...keys);
      },
      keysByPattern: (pattern: string) => client.keys(pattern),
    };
  } catch {
    return null;
  }
}

async function createRedisDriverFromNodeRedis(redisUrl: string): Promise<RedisDriver | null> {
  try {
    const module = await dynamicImport('redis');
    if (typeof module?.createClient !== 'function') return null;

    const client = module.createClient({ url: redisUrl });
    client.on?.('error', (error: unknown) => {
      logger.warn('Redis runtime error', { error });
    });

    await client.connect();
    await client.ping();

    return {
      get: (key: string) => client.get(key),
      setEx: async (key: string, ttlSeconds: number, value: string) => {
        await client.setEx(key, ttlSeconds, value);
      },
      del: async (keys: string[]) => {
        if (keys.length === 0) return;
        await client.del(keys);
      },
      keysByPattern: (pattern: string) => client.keys(pattern),
    };
  } catch {
    return null;
  }
}

async function initializeRedisDriver(): Promise<RedisDriver | null> {
  if (!REDIS_URL.trim()) {
    return null;
  }

  const fromIoredis = await createRedisDriverFromIoredis(REDIS_URL);
  if (fromIoredis) {
    if (!redisInitLogged) {
      redisInitLogged = true;
      logger.info('Redis cache attiva tramite ioredis');
    }
    return fromIoredis;
  }

  const fromNodeRedis = await createRedisDriverFromNodeRedis(REDIS_URL);
  if (fromNodeRedis) {
    if (!redisInitLogged) {
      redisInitLogged = true;
      logger.info('Redis cache attiva tramite redis client');
    }
    return fromNodeRedis;
  }

  logRedisFallbackOnce(
    'REDIS_URL configurata ma nessun client Redis disponibile: fallback in-memory attivo',
    'missing redis package or connection failure'
  );
  return null;
}

async function getRedisDriver(): Promise<RedisDriver | null> {
  if (redisDriver !== undefined) {
    return redisDriver;
  }

  redisDriver = await initializeRedisDriver();
  return redisDriver;
}

function toPayload(value: unknown): string {
  return JSON.stringify(value);
}

function fromPayload<T>(payload: string): T {
  return JSON.parse(payload) as T;
}

export function buildCacheKey(namespace: string, payload?: unknown): string {
  if (payload === undefined) return namespace;
  const digest = createHash('sha1')
    .update(stableJsonStringify(payload))
    .digest('hex');
  return `${namespace}:${digest}`;
}

export async function getCache<T>(key: string): Promise<CacheResult<T>> {
  const redis = await getRedisDriver();

  if (redis) {
    try {
      const raw = await redis.get(key);
      if (raw !== null) {
        const parsed = fromPayload<T>(raw);
        memoryCache.set(key, parsed, DEFAULT_TTL_SECONDS);
        return { hit: true, value: parsed, provider: 'redis' };
      }
    } catch (error) {
      redisDriver = null;
      logRedisFallbackOnce('Errore lettura Redis: fallback in-memory', error);
    }
  }

  const fromMemory = memoryCache.get<T>(key);
  if (fromMemory !== undefined) {
    return { hit: true, value: fromMemory, provider: 'memory' };
  }

  return { hit: false, provider: 'none' };
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<void> {
  memoryCache.set(key, value, ttlSeconds);

  const redis = await getRedisDriver();
  if (!redis) return;

  try {
    await redis.setEx(key, ttlSeconds, toPayload(value));
  } catch (error) {
    redisDriver = null;
    logRedisFallbackOnce('Errore scrittura Redis: fallback in-memory', error);
  }
}

export async function deleteCache(keyOrKeys: string | string[]): Promise<void> {
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  if (keys.length === 0) return;

  memoryCache.del(keys);

  const redis = await getRedisDriver();
  if (!redis) return;

  try {
    await redis.del(keys);
  } catch (error) {
    redisDriver = null;
    logRedisFallbackOnce('Errore invalidazione Redis: fallback in-memory', error);
  }
}

export async function deleteCacheByPrefix(prefix: string): Promise<void> {
  const memoryKeys = memoryCache.keys().filter((key) => key.startsWith(prefix));
  if (memoryKeys.length > 0) {
    memoryCache.del(memoryKeys);
  }

  const redis = await getRedisDriver();
  if (!redis) return;

  try {
    const redisKeys = await redis.keysByPattern(`${prefix}*`);
    if (redisKeys.length > 0) {
      await redis.del(redisKeys);
    }
  } catch (error) {
    redisDriver = null;
    logRedisFallbackOnce('Errore invalidazione prefix Redis: fallback in-memory', error);
  }
}

export async function rememberCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<CacheResult<T> & { value: T }> {
  const cached = await getCache<T>(key);
  if (cached.hit) {
    return cached;
  }

  const value = await loader();
  await setCache(key, value, ttlSeconds);
  return { hit: false, provider: 'none', value };
}
