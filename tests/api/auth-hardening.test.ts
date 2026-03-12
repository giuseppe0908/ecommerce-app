import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';

import bcrypt from 'bcrypt';

import prisma from '../../server/utils/prisma';
import { AUTH_SESSION_COOKIE_NAME, signSessionToken } from '../../server/utils/session';
import {
  expectStatusCode,
  getResponseHeader,
  installNuxtRouteStubs,
  loadRouteHandler,
  makeMockEvent,
  resetMockRuntimeConfig,
  setMockRuntimeConfig,
} from '../helpers/nuxt-route-test-utils';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'unit-test-jwt-secret';
installNuxtRouteStubs();

function getCookieHeaderFromSetCookie(event: {
  node: { res: { getHeader: (name: string) => string | string[] | undefined } };
}) {
  const setCookieHeader = getResponseHeader(event, 'set-cookie');
  const firstCookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  return String(firstCookie || '').split(';')[0];
}

function patchProperty<T extends object, K extends keyof T>(
  t: TestContext,
  target: T,
  key: K,
  value: T[K]
) {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, {
    configurable: true,
    writable: true,
    value,
  });

  t.after(() => {
    if (descriptor) {
      Object.defineProperty(target, key, descriptor);
      return;
    }

    delete (target as Record<string, unknown>)[String(key)];
  });
}

function patchPrismaDelegate<T extends keyof typeof prisma>(
  t: TestContext,
  key: T,
  value: (typeof prisma)[T]
) {
  patchProperty(t, prisma, key, value);
}

function mockPrismaTransaction(
  t: TestContext,
  implementation?: (arg: unknown) => Promise<unknown>
) {
  patchProperty(t, prisma, '$transaction', (async (arg: unknown) => {
    if (implementation) {
      return implementation(arg);
    }

    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }

    if (typeof arg === 'function') {
      return arg(prisma as never);
    }

    return arg;
  }) as (typeof prisma)['$transaction']);
}

test('register creates a public user with normalized email', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/auth/register.js', import.meta.url).href
  );
  let createdUserData: Record<string, unknown> | null = null;

  patchPrismaDelegate(t, 'user', {
    findUnique: async () => null,
    create: async ({ data }: { data: Record<string, unknown> }) => {
      createdUserData = data;
      return {
        id: 21,
        ...data,
      };
    },
  } as never);

  const event = makeMockEvent({
    method: 'POST',
    body: {
      name: 'Mario',
      surname: 'Rossi',
      email: 'Mario.Rossi@Example.com',
      password: 'Password123!',
      address: 'Via Roma 1',
      number: '3331234567',
    },
  });

  const response = await handler(event);

  assert.equal(response.user.email, 'mario.rossi@example.com');
  assert.equal(response.user.role, 'USER');
  assert.ok(createdUserData);
  assert.equal(createdUserData?.email, 'mario.rossi@example.com');
  assert.notEqual(createdUserData?.password, 'Password123!');
});

test('login issues a session cookie and returns the authenticated user', async (t) => {
  const handler = await loadRouteHandler(new URL('../../server/api/login.ts', import.meta.url).href);
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  patchPrismaDelegate(t, 'user', {
    findUnique: async () => ({
      id: 8,
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario@example.com',
      password: hashedPassword,
      role: 'USER',
      address: 'Via Roma 1',
      number: '3331234567',
    }),
  } as never);
  patchPrismaDelegate(t, 'token', {
    deleteMany: async () => ({ count: 1 }),
    create: async ({ data }: { data: Record<string, unknown> }) => ({
      id: 1,
      ...data,
    }),
  } as never);
  mockPrismaTransaction(t);

  const event = makeMockEvent({
    method: 'POST',
    body: {
      email: 'mario@example.com',
      password: 'Password123!',
    },
  });

  const response = await handler(event);
  const setCookieHeader = getResponseHeader(event, 'set-cookie');

  assert.equal(response.success, true);
  assert.equal(response.user.email, 'mario@example.com');
  assert.ok(typeof response.token === 'string' && response.token.length > 20);
  assert.ok(String(setCookieHeader).includes(`${AUTH_SESSION_COOKIE_NAME}=`));
  assert.ok(String(setCookieHeader).includes('HttpOnly'));
});

test('logout revokes the active session and clears the cookie', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/auth/logout.post.ts', import.meta.url).href
  );
  const token = signSessionToken({
    id: 33,
    email: 'logout@example.com',
    role: 'USER',
  });

  let revokedWhere: Record<string, unknown> | null = null;
  patchPrismaDelegate(t, 'token', {
    findFirst: async () => ({ id: 1 }),
    deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
      revokedWhere = where;
      return { count: 1 };
    },
  } as never);
  patchPrismaDelegate(t, 'user', {
    findUnique: async () => ({
      id: 33,
      role: 'USER',
      name: 'Logout',
      surname: 'User',
      email: 'logout@example.com',
      address: null,
      number: null,
    }),
  } as never);

  const event = makeMockEvent({
    method: 'POST',
    headers: {
      cookie: `${AUTH_SESSION_COOKIE_NAME}=${token}`,
    },
  });

  const response = await handler(event);
  const setCookieHeader = getResponseHeader(event, 'set-cookie');

  assert.equal(response.success, true);
  assert.equal(revokedWhere?.userId, 33);
  assert.ok(String(setCookieHeader).includes(`${AUTH_SESSION_COOKIE_NAME}=`));
  assert.ok(String(setCookieHeader).includes('Max-Age=0'));
});

test('me returns the protected profile for a valid session cookie', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/auth/me.js', import.meta.url).href
  );
  const token = signSessionToken({
    id: 55,
    email: 'profile@example.com',
    role: 'USER',
  });

  patchPrismaDelegate(t, 'token', {
    findFirst: async () => ({ id: 1 }),
  } as never);
  patchPrismaDelegate(t, 'user', {
    findUnique: async () => ({
      id: 55,
      role: 'USER',
      name: 'Profile',
      surname: 'User',
      email: 'profile@example.com',
      address: 'Via Milano 2',
      number: '3337654321',
    }),
  } as never);

  const event = makeMockEvent({
    method: 'GET',
    headers: {
      cookie: `${AUTH_SESSION_COOKIE_NAME}=${token}`,
    },
  });

  const response = await handler(event);

  assert.equal(response.authenticated, true);
  assert.equal(response.user.id, 55);
  assert.equal(response.user.email, 'profile@example.com');
});

test('forgot-password returns a generic success response and queues the reset email', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/auth/forgot-password.js', import.meta.url).href
  );

  setMockRuntimeConfig({
    public: {
      appBaseUrl: 'https://preview.example.com',
    },
  });
  t.after(() => resetMockRuntimeConfig());

  process.env.EMAIL_USER = 'noreply@example.com';
  process.env.EMAIL_PASS = 'app-password';

  patchPrismaDelegate(t, 'user', {
    findUnique: async () => ({
      id: 77,
      email: 'reset@example.com',
    }),
  } as never);
  patchPrismaDelegate(t, 'resetToken', {
    deleteMany: async () => ({ count: 1 }),
    create: async ({ data }: { data: Record<string, unknown> }) => ({
      id: 1,
      ...data,
    }),
  } as never);
  mockPrismaTransaction(t);

  const nodemailer = await import('nodemailer');
  let sentMail: Record<string, unknown> | null = null;
  patchProperty(
    t,
    nodemailer.default,
    'createTransport',
    (() => ({
      sendMail: async (payload: Record<string, unknown>) => {
        sentMail = payload;
        return { accepted: [payload.to] };
      },
    })) as typeof nodemailer.default.createTransport
  );

  const event = makeMockEvent({
    method: 'POST',
    url: '/api/auth/forgot-password',
    body: {
      email: 'reset@example.com',
    },
  });

  const response = await handler(event);

  assert.equal(response.success, true);
  assert.ok(String(sentMail?.html || '').includes('https://preview.example.com/reset-password?token='));
});

test('reset-password updates the password, deletes reset tokens and revokes active sessions', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/auth/reset-password.js', import.meta.url).href
  );
  const currentPassword = await bcrypt.hash('OldPassword123!', 10);

  patchPrismaDelegate(t, 'resetToken', {
    findFirst: async () => ({
      id: 3,
      userId: 88,
      token: 'hashed-reset-token',
      expiresAt: new Date(Date.now() + 60_000),
    }),
    deleteMany: async () => ({ count: 1 }),
  } as never);
  patchPrismaDelegate(t, 'user', {
    findUnique: async () => ({
      password: currentPassword,
    }),
    update: async ({ data }: { data: Record<string, unknown> }) => ({
      id: 88,
      ...data,
    }),
  } as never);
  patchPrismaDelegate(t, 'token', {
    deleteMany: async () => ({ count: 2 }),
  } as never);
  mockPrismaTransaction(t);

  const event = makeMockEvent({
    method: 'POST',
    body: {
      token: 'plain-reset-token',
      password: 'NewPassword456!',
    },
  });

  const response = await handler(event);

  assert.equal(response.success, true);
  assert.equal(response.message, 'Password aggiornata con successo');
});

test('github callback standard flow creates a linked session and redirects to authcallback', async (t) => {
  setMockRuntimeConfig({
    githubClientId: 'github-client-id',
    githubClientSecret: 'github-client-secret',
    githubCallbackUrl: 'http://localhost:3000/api/auth/github/callback',
    public: {
      appBaseUrl: 'http://localhost:3000',
    },
  });
  t.after(() => resetMockRuntimeConfig());

  const githubHandler = await loadRouteHandler(
    new URL('../../server/api/auth/github.get.ts', import.meta.url).href
  );
  const callbackHandler = await loadRouteHandler(
    new URL('../../server/api/auth/github/callback.get.ts', import.meta.url).href
  );

  const githubEvent = makeMockEvent({
    method: 'GET',
    url: '/api/auth/github',
    headers: {
      host: 'localhost:3000',
    },
  });

  const githubResponse = await githubHandler(githubEvent);
  const authUrl = new URL(githubResponse.url);
  const state = authUrl.searchParams.get('state');
  const cookieHeader = getCookieHeaderFromSetCookie(githubEvent);

  assert.ok(state);
  assert.ok(cookieHeader.startsWith('oauth_state='));

  patchProperty(t, globalThis, 'fetch', (async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('github.com/login/oauth/access_token')) {
      return new Response(JSON.stringify({ access_token: 'gh-access-token' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.includes('api.github.com/user/emails')) {
      return new Response(
        JSON.stringify([{ email: 'octocat@example.com', primary: true, verified: true }]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ id: 1234, login: 'octocat', name: 'Octo Cat' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof globalThis.fetch);

  patchPrismaDelegate(t, 'user', {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      if (where.githubId) {
        return null;
      }
      return null;
    },
  } as never);
  patchPrismaDelegate(t, 'token', {
    deleteMany: async () => ({ count: 0 }),
    create: async ({ data }: { data: Record<string, unknown> }) => ({
      id: 1,
      ...data,
    }),
  } as never);
  mockPrismaTransaction(t, async (arg) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }

    if (typeof arg === 'function') {
      return arg({
        user: {
          findUnique: async ({ where }: { where: Record<string, unknown> }) =>
            where.email ? null : null,
          update: async () => {
            throw new Error('user.update should not be called in the standard GitHub flow');
          },
          create: async ({ data }: { data: Record<string, unknown> }) => ({
            id: 500,
            role: 'USER',
            ...data,
          }),
        },
      });
    }

    return arg;
  });

  const callbackEvent = makeMockEvent({
    method: 'GET',
    url: `/api/auth/github/callback?code=oauth-code&state=${state}`,
    headers: {
      cookie: cookieHeader,
      host: 'localhost:3000',
    },
  });

  await callbackHandler(callbackEvent);

  assert.equal(callbackEvent.node.res.statusCode, 302);
  assert.equal(getResponseHeader(callbackEvent, 'location'), '/authcallback');
  assert.ok(String(getResponseHeader(callbackEvent, 'set-cookie')).includes(`${AUTH_SESSION_COOKIE_NAME}=`));
});

test('github callback links an existing email instead of creating a duplicate user', async (t) => {
  setMockRuntimeConfig({
    githubClientId: 'github-client-id',
    githubClientSecret: 'github-client-secret',
    githubCallbackUrl: 'http://localhost:3000/api/auth/github/callback',
    public: {
      appBaseUrl: 'http://localhost:3000',
    },
  });
  t.after(() => resetMockRuntimeConfig());

  const githubHandler = await loadRouteHandler(
    new URL('../../server/api/auth/github.get.ts', import.meta.url).href
  );
  const callbackHandler = await loadRouteHandler(
    new URL('../../server/api/auth/github/callback.get.ts', import.meta.url).href
  );

  const githubEvent = makeMockEvent({
    method: 'GET',
    url: '/api/auth/github',
    headers: {
      host: 'localhost:3000',
    },
  });

  const githubResponse = await githubHandler(githubEvent);
  const authUrl = new URL(githubResponse.url);
  const state = authUrl.searchParams.get('state');
  const cookieHeader = getCookieHeaderFromSetCookie(githubEvent);

  patchProperty(t, globalThis, 'fetch', (async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('github.com/login/oauth/access_token')) {
      return new Response(JSON.stringify({ access_token: 'gh-access-token' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.includes('api.github.com/user/emails')) {
      return new Response(
        JSON.stringify([{ email: 'existing@example.com', primary: true, verified: true }]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ id: 999, login: 'existing-gh', name: 'Existing GH' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof globalThis.fetch);

  let createdCalled = false;
  let updatedUserData: Record<string, unknown> | null = null;

  patchPrismaDelegate(t, 'user', {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      if (where.githubId) {
        return null;
      }
      return null;
    },
  } as never);
  patchPrismaDelegate(t, 'token', {
    deleteMany: async () => ({ count: 0 }),
    create: async ({ data }: { data: Record<string, unknown> }) => ({
      id: 1,
      ...data,
    }),
  } as never);
  mockPrismaTransaction(t, async (arg) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }

    if (typeof arg === 'function') {
      return arg({
        user: {
          findUnique: async ({ where }: { where: Record<string, unknown> }) =>
            where.email
              ? {
                  id: 700,
                  email: 'existing@example.com',
                  githubId: null,
                  name: null,
                  role: 'USER',
                }
              : null,
          update: async ({ data }: { data: Record<string, unknown> }) => {
            updatedUserData = data;
            return {
              id: 700,
              email: 'existing@example.com',
              role: 'USER',
              ...data,
            };
          },
          create: async () => {
            createdCalled = true;
            return null;
          },
        },
      });
    }

    return arg;
  });

  const callbackEvent = makeMockEvent({
    method: 'GET',
    url: `/api/auth/github/callback?code=oauth-code&state=${state}`,
    headers: {
      cookie: cookieHeader,
      host: 'localhost:3000',
    },
  });

  await callbackHandler(callbackEvent);

  assert.equal(callbackEvent.node.res.statusCode, 302);
  assert.equal(getResponseHeader(callbackEvent, 'location'), '/authcallback');
  assert.equal(createdCalled, false);
  assert.equal(updatedUserData?.githubId, '999');
});

test('admin statistics route rejects authenticated non-admin users', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/admin/statistics.get.ts', import.meta.url).href
  );
  const token = signSessionToken({
    id: 301,
    email: 'user@example.com',
    role: 'USER',
  });

  patchPrismaDelegate(t, 'token', {
    findFirst: async () => ({ id: 1 }),
  } as never);
  patchPrismaDelegate(t, 'user', {
    findUnique: async () => ({
      id: 301,
      role: 'USER',
      name: 'Mario',
      surname: 'Rossi',
      email: 'user@example.com',
      address: null,
      number: null,
    }),
  } as never);

  const event = makeMockEvent({
    method: 'GET',
    url: '/api/admin/statistics',
    headers: {
      cookie: `${AUTH_SESSION_COOKIE_NAME}=${token}`,
    },
  });

  await expectStatusCode(handler, event, 403);
});

test('auth rate limit middleware blocks repeated login attempts from the same IP', async () => {
  const handler = await loadRouteHandler(
    new URL('../../server/middleware/zz-auth-rate-limit.ts', import.meta.url).href
  );

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const event = makeMockEvent({
      method: 'POST',
      url: '/api/login',
      headers: {
        'x-forwarded-for': '198.51.100.10',
      },
    });
    await handler(event);
  }

  const blockedEvent = makeMockEvent({
    method: 'POST',
    url: '/api/login',
    headers: {
      'x-forwarded-for': '198.51.100.10',
    },
  });

  await assert.rejects(
    () => handler(blockedEvent),
    (error: any) => error?.statusCode === 429
  );
  assert.ok(String(getResponseHeader(blockedEvent, 'retry-after')).length > 0);
});

test('auth rate limit middleware protects forgot-password independently from login', async () => {
  const handler = await loadRouteHandler(
    new URL('../../server/middleware/zz-auth-rate-limit.ts', import.meta.url).href
  );

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const event = makeMockEvent({
      method: 'POST',
      url: '/api/auth/forgot-password',
      headers: {
        'x-forwarded-for': '198.51.100.22',
      },
    });
    await handler(event);
  }

  const blockedEvent = makeMockEvent({
    method: 'POST',
    url: '/api/auth/forgot-password',
    headers: {
      'x-forwarded-for': '198.51.100.22',
    },
  });

  await assert.rejects(
    () => handler(blockedEvent),
    (error: any) => error?.statusCode === 429
  );
});
