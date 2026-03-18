import test from 'node:test';

import {
  expectStatusCode,
  installNuxtRouteStubs,
  loadRouteHandler,
  makeMockEvent,
} from '../helpers/nuxt-route-test-utils';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'unit-test-jwt-secret';
installNuxtRouteStubs();

test('auth/login returns 400 for invalid payload', async () => {
  const handler = await loadRouteHandler(new URL('../../server/api/login.ts', import.meta.url).href);
  const event = makeMockEvent({
    method: 'POST',
    body: {
      email: 'invalid-email-format',
      password: '',
    },
  });

  await expectStatusCode(handler, event, 400);
});

test('order endpoint returns 400 for incomplete order payload', async () => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/order/order.js', import.meta.url).href
  );
  const event = makeMockEvent({
    method: 'POST',
    body: {
      email: 'cliente@example.com',
      products: [],
    },
  });

  await expectStatusCode(handler, event, 400);
});

test('favorites GET returns 401 when Authorization header is missing', async () => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/favorites.ts', import.meta.url).href
  );
  const event = makeMockEvent({
    method: 'GET',
    headers: {},
  });

  await expectStatusCode(handler, event, 401);
});

test('reviews POST returns 401 when Authorization header is missing', async () => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/reviews/index.ts', import.meta.url).href
  );
  const event = makeMockEvent({
    method: 'POST',
    body: {
      productId: 1,
      rating: 5,
      comment: 'Prodotto ottimo',
    },
    headers: {},
  });

  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await expectStatusCode(handler, event, 401);
  } finally {
    console.error = originalConsoleError;
  }
});

test('admin middleware returns 401 when Authorization header is missing', async () => {
  const handler = await loadRouteHandler(
    new URL('../../server/middleware/zz-admin-auth.ts', import.meta.url).href
  );
  const event = makeMockEvent({
    method: 'GET',
    headers: {},
  });

  (event.node.req as { url?: string }).url = '/api/admin/statistics';
  await expectStatusCode(handler, event, 401);
});
