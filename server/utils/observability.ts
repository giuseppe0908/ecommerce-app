type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

type ApiMetricInput = {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
};

type ApiRouteMetric = {
  method: string;
  path: string;
  count: number;
  clientErrors: number;
  serverErrors: number;
  totalDurationMs: number;
  maxDurationMs: number;
  lastStatusCode: number;
  lastSeenAt: string;
  byStatus: Record<string, number>;
};

const LOG_PRIORITIES: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEY_PATTERN = /(password|token|secret|authorization|cookie|pass|jwt)/i;
const EMAIL_KEY_PATTERN = /email/i;
const MAX_STRING_LENGTH = 500;
const MAX_OBJECT_KEYS = 50;
const MAX_ARRAY_ITEMS = 30;
const OBSERVABILITY_STARTED_AT = Date.now();

const apiMetrics = {
  totalRequests: 0,
  totalDurationMs: 0,
  clientErrors: 0,
  serverErrors: 0,
  routes: new Map<string, ApiRouteMetric>(),
};

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getConfiguredLogLevel(): LogLevel {
  const rawLevel = String(process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
  if (rawLevel === 'debug' || rawLevel === 'info' || rawLevel === 'warn' || rawLevel === 'error') {
    return rawLevel;
  }
  return 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_PRIORITIES[level] >= LOG_PRIORITIES[getConfiguredLogLevel()];
}

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}...[truncated]`;
}

function maskEmail(email: string): string {
  const normalized = email.trim();
  const atIndex = normalized.indexOf('@');
  if (atIndex <= 1) return '[REDACTED_EMAIL]';

  const userPart = normalized.slice(0, atIndex);
  const domainPart = normalized.slice(atIndex);
  return `${userPart[0]}***${domainPart}`;
}

function sanitizeValue(value: unknown, key: string | null, visited: WeakSet<object>): unknown {
  if (key && SENSITIVE_KEY_PATTERN.test(key)) {
    return '[REDACTED]';
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncateString(value.message || 'Unknown error'),
      stack:
        process.env.NODE_ENV === 'development' && typeof value.stack === 'string'
          ? truncateString(value.stack)
          : undefined,
    };
  }

  if (value === null || value === undefined) {
    return value;
  }

  const valueType = typeof value;
  if (valueType === 'string') {
    const stringValue = value as string;
    if (key && EMAIL_KEY_PATTERN.test(key)) {
      return maskEmail(stringValue);
    }
    return truncateString(stringValue);
  }

  if (valueType === 'number' || valueType === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, null, visited));
  }

  if (valueType === 'object') {
    const objectValue = value as Record<string, unknown>;
    if (visited.has(objectValue)) {
      return '[Circular]';
    }
    visited.add(objectValue);

    const entries = Object.entries(objectValue).slice(0, MAX_OBJECT_KEYS);
    const sanitizedObject: Record<string, unknown> = {};

    for (const [childKey, childValue] of entries) {
      sanitizedObject[childKey] = sanitizeValue(childValue, childKey, visited);
    }

    return sanitizedObject;
  }

  return String(value);
}

function sanitizeContext(context: LogContext | undefined): LogContext | undefined {
  if (!context || typeof context !== 'object') {
    return undefined;
  }

  return sanitizeValue(context, null, new WeakSet()) as LogContext;
}

function writeLog(level: LogLevel, message: string, scope: string, context?: LogContext) {
  if (!shouldLog(level)) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    ...(context ? { context: sanitizeContext(context) } : {}),
  };

  const serialized = JSON.stringify(entry);

  if (level === 'debug') console.debug(serialized);
  else if (level === 'info') console.info(serialized);
  else if (level === 'warn') console.warn(serialized);
  else console.error(serialized);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normalizeMetricPath(path: string): string {
  if (!path) return '/';

  const withoutQuery = path.split('?')[0] || '/';
  const segments = withoutQuery.split('/').filter(Boolean);

  if (segments.length === 0) return '/';

  const normalized = segments.map((segment) => {
    if (/^\d+$/.test(segment)) return ':id';
    if (/^[0-9a-fA-F]{16,}$/.test(segment)) return ':token';
    if (segment.length > 64) return ':value';
    return segment;
  });

  return `/${normalized.join('/')}`;
}

export function getRequestIdFromHeader(
  requestIdHeader: string | string[] | undefined | null
): string {
  const value = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader;
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (normalized) return normalized;

  const randomPart = Math.random().toString(36).slice(2, 10);
  return `req_${Date.now()}_${randomPart}`;
}

export function createLogger(scope: string) {
  return {
    debug(message: string, context?: LogContext) {
      writeLog('debug', message, scope, context);
    },
    info(message: string, context?: LogContext) {
      writeLog('info', message, scope, context);
    },
    warn(message: string, context?: LogContext) {
      writeLog('warn', message, scope, context);
    },
    error(message: string, context?: LogContext) {
      writeLog('error', message, scope, context);
    },
  };
}

export function recordApiMetric(input: ApiMetricInput) {
  const method = String(input.method || 'GET').toUpperCase();
  const path = normalizeMetricPath(String(input.path || '/'));
  const statusCode = toFiniteNumber(input.statusCode, 500);
  const durationMs = Math.max(0, toFiniteNumber(input.durationMs, 0));
  const key = `${method} ${path}`;

  let routeMetric = apiMetrics.routes.get(key);
  if (!routeMetric) {
    routeMetric = {
      method,
      path,
      count: 0,
      clientErrors: 0,
      serverErrors: 0,
      totalDurationMs: 0,
      maxDurationMs: 0,
      lastStatusCode: statusCode,
      lastSeenAt: new Date().toISOString(),
      byStatus: {},
    };
    apiMetrics.routes.set(key, routeMetric);
  }

  routeMetric.count += 1;
  routeMetric.totalDurationMs += durationMs;
  routeMetric.maxDurationMs = Math.max(routeMetric.maxDurationMs, durationMs);
  routeMetric.lastStatusCode = statusCode;
  routeMetric.lastSeenAt = new Date().toISOString();
  routeMetric.byStatus[String(statusCode)] = (routeMetric.byStatus[String(statusCode)] || 0) + 1;

  if (statusCode >= 400 && statusCode < 500) {
    routeMetric.clientErrors += 1;
    apiMetrics.clientErrors += 1;
  } else if (statusCode >= 500) {
    routeMetric.serverErrors += 1;
    apiMetrics.serverErrors += 1;
  }

  apiMetrics.totalRequests += 1;
  apiMetrics.totalDurationMs += durationMs;
}

export function getApiMetricsSnapshot() {
  const uptimeSeconds = Math.round((Date.now() - OBSERVABILITY_STARTED_AT) / 1000);
  const avgLatencyMs =
    apiMetrics.totalRequests > 0 ? apiMetrics.totalDurationMs / apiMetrics.totalRequests : 0;

  const routes = [...apiMetrics.routes.values()].map((metric) => ({
    method: metric.method,
    path: metric.path,
    count: metric.count,
    clientErrors: metric.clientErrors,
    serverErrors: metric.serverErrors,
    avgDurationMs: round(metric.totalDurationMs / Math.max(1, metric.count)),
    maxDurationMs: round(metric.maxDurationMs),
    lastStatusCode: metric.lastStatusCode,
    lastSeenAt: metric.lastSeenAt,
    byStatus: metric.byStatus,
  }));

  const topSlowRoutes = [...routes]
    .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
    .slice(0, 10);

  const topRequestedRoutes = [...routes]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    startedAt: new Date(OBSERVABILITY_STARTED_AT).toISOString(),
    uptimeSeconds,
    totals: {
      requests: apiMetrics.totalRequests,
      clientErrors: apiMetrics.clientErrors,
      serverErrors: apiMetrics.serverErrors,
      avgDurationMs: round(avgLatencyMs),
    },
    routes,
    topSlowRoutes,
    topRequestedRoutes,
  };
}
