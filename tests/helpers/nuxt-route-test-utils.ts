import assert from 'node:assert/strict';

type MockEventInput = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, string>;
  url?: string;
};

const STUBS_FLAG = '__NUXT_ROUTE_STUBS_INSTALLED__';
const RUNTIME_CONFIG_FLAG = '__NUXT_TEST_RUNTIME_CONFIG__';

function createMockResponse() {
  const headers = new Map<string, string | string[]>();

  return {
    statusCode: 200,
    headersSent: false,
    body: undefined as unknown,
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    getHeaders() {
      return Object.fromEntries(headers.entries());
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
    },
    removeHeader(name: string) {
      headers.delete(name.toLowerCase());
    },
    writeHead(statusCode: number) {
      this.statusCode = statusCode;
      return this;
    },
    end(data?: unknown) {
      this.body = data;
      this.headersSent = true;
      return this;
    },
  };
}

export function installNuxtRouteStubs() {
  if ((globalThis as Record<string, unknown>)[STUBS_FLAG]) {
    return;
  }

  (globalThis as Record<string, unknown>).defineEventHandler = (handler: unknown) => handler;
  (globalThis as Record<string, unknown>).createError = (payload: Record<string, unknown> = {}) => {
    const message = String(payload.message ?? payload.statusMessage ?? 'Request error');
    const error = new Error(message) as Error & Record<string, unknown>;
    Object.assign(error, payload);
    if (!error.statusCode) error.statusCode = 500;
    if (!error.statusMessage) error.statusMessage = message;
    return error;
  };
  (globalThis as Record<string, unknown>).readBody = async (event: Record<string, unknown>) =>
    event.__body;
  (globalThis as Record<string, unknown>).getQuery = (event: Record<string, unknown>) =>
    event.__query ?? {};
  (globalThis as Record<string, unknown>).getRequestHeader = (
    event: Record<string, unknown>,
    name: string
  ) => {
    const headers = (event.node as { req?: { headers?: Record<string, string> } } | undefined)?.req
      ?.headers;
    if (!headers) return undefined;
    return headers[name.toLowerCase()] ?? headers[name];
  };
  (globalThis as Record<string, unknown>).setResponseStatus = (
    event: Record<string, unknown>,
    statusCode: number
  ) => {
    const node = event.node as { res?: Record<string, unknown> } | undefined;
    if (!node) return;
    node.res = node.res || {};
    node.res.statusCode = statusCode;
  };
  (globalThis as Record<string, unknown>).setHeader = (
    event: Record<string, unknown>,
    name: string,
    value: string
  ) => {
    const node = event.node as { res?: Record<string, unknown> } | undefined;
    if (!node) return;
    node.res = node.res || {};
    const headers =
      (node.res.headers as Record<string, string> | undefined) ||
      ({} as Record<string, string>);
    headers[name] = value;
    node.res.headers = headers;
  };
  (globalThis as Record<string, unknown>).useRuntimeConfig = () =>
    ((globalThis as Record<string, unknown>)[RUNTIME_CONFIG_FLAG] as Record<string, unknown>) || {
      public: {},
    };

  (globalThis as Record<string, unknown>)[STUBS_FLAG] = true;
}

export function setMockRuntimeConfig(config: Record<string, unknown>) {
  (globalThis as Record<string, unknown>)[RUNTIME_CONFIG_FLAG] = config;
}

export function resetMockRuntimeConfig() {
  delete (globalThis as Record<string, unknown>)[RUNTIME_CONFIG_FLAG];
}

export function makeMockEvent(input: MockEventInput = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(input.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])
  );
  const url = input.url || '/';
  if (!normalizedHeaders.host) {
    normalizedHeaders.host = 'localhost:3000';
  }

  return {
    handled: false,
    path: url,
    node: {
      req: {
        method: input.method ?? 'POST',
        headers: normalizedHeaders,
        url,
      },
      res: createMockResponse(),
    },
    context: {
      params: input.params ?? {},
    },
    __body: input.body,
    __query: input.query ?? {},
  };
}

export async function loadRouteHandler(moduleHref: string) {
  const moduleUrl = new URL(moduleHref);
  moduleUrl.searchParams.set('test', `${Date.now()}-${Math.random()}`);
  const imported = (await import(moduleUrl.href)) as { default: (event: unknown) => unknown };
  return imported.default;
}

export async function expectStatusCode(
  handler: (event: unknown) => unknown,
  event: unknown,
  expectedStatusCode: number
) {
  await assert.rejects(
    async () => {
      await handler(event);
    },
    (error: unknown) => {
      return (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        (error as { statusCode?: number }).statusCode === expectedStatusCode
      );
    }
  );
}

export function getResponseHeader(event: {
  node: { res: { getHeader: (name: string) => string | string[] | undefined } };
}, name: string) {
  return event.node.res.getHeader(name);
}
