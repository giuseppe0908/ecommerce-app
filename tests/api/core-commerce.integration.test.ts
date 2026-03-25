import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';

import prisma from '../../server/utils/prisma';
import { AUTH_SESSION_COOKIE_NAME, signSessionToken } from '../../server/utils/session';
import {
  expectStatusCode,
  installNuxtRouteStubs,
  loadRouteHandler,
  makeMockEvent,
} from '../helpers/nuxt-route-test-utils';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'unit-test-jwt-secret';
installNuxtRouteStubs();

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
  tx: Record<string, unknown>
) {
  patchProperty(
    t,
    prisma,
    '$transaction',
    (async (arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }

      if (typeof arg === 'function') {
        return arg(tx as never);
      }

      return arg;
    }) as (typeof prisma)['$transaction']
  );
}

function createSessionCookie(user: {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
}) {
  const token = signSessionToken(user);
  return `${AUTH_SESSION_COOKIE_NAME}=${token}`;
}

function mockAuthenticatedSession(
  t: TestContext,
  user: {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN';
    name?: string | null;
    surname?: string | null;
    address?: string | null;
    number?: string | null;
  }
) {
  patchPrismaDelegate(t, 'token', {
    findFirst: async () => ({ id: 1 }),
  } as never);
  patchPrismaDelegate(t, 'user', {
    findUnique: async () => ({
      id: user.id,
      role: user.role,
      name: user.name ?? null,
      surname: user.surname ?? null,
      email: user.email,
      address: user.address ?? null,
      number: user.number ?? null,
    }),
  } as never);

  return createSessionCookie(user);
}

function createRawOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 701,
    idUtente: 44,
    price: 120,
    subtotal: 110,
    shippingAmount: 10,
    currency: 'eur',
    status: 'PROCESSING',
    paymentStatus: 'SUCCEEDED',
    paymentIntentId: 'pi_order_1',
    customerName: 'Mario',
    customerSurname: 'Rossi',
    customerEmail: 'mario@example.com',
    customerPhone: '3331234567',
    shippingAddress: 'Via Roma 1',
    paidAt: new Date('2026-03-01T10:00:00.000Z'),
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    updatedAt: new Date('2026-03-01T10:05:00.000Z'),
    user: {
      id: 44,
      email: 'mario@example.com',
      name: 'Mario',
      surname: 'Rossi',
      address: 'Via Roma 1',
      number: '3331234567',
    },
    products: [
      {
        id: 1,
        productId: 11,
        quantity: 2,
        product: {
          id: 11,
          name: 'Sneaker Runner',
          photo: '/shoe.jpg',
          price: 55,
        },
      },
    ],
    ...overrides,
  } as never;
}

function createCheckoutDraftRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'chk_core_1',
    userId: null,
    orderId: null,
    customerName: 'Giulia',
    customerSurname: 'Bianchi',
    customerEmail: 'giulia@example.com',
    shippingAddress: 'Via Milano 20',
    customerPhone: '3339876543',
    currency: 'eur',
    subtotal: 110,
    shippingAmount: 0,
    totalAmount: 110,
    status: 'OPEN',
    paymentStatus: 'PENDING',
    paymentIntentId: null,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: null,
    items: [
      {
        id: 1,
        checkoutSessionId: 'chk_core_1',
        productId: 11,
        quantity: 2,
        unitPrice: 55,
        productName: 'Sneaker Runner',
        productPhoto: '/shoe.jpg',
        product: {
          id: 11,
          name: 'Sneaker Runner',
          photo: '/shoe.jpg',
          price: 55,
        },
      },
    ],
    ...overrides,
  } as never;
}

test('catalog search returns paginated results and normalizes core edge filters', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/products/search.ts', import.meta.url).href
  );

  let countArgs: Record<string, unknown> | null = null;
  let findManyArgs: Record<string, unknown> | null = null;
  let aggregateArgs: Record<string, unknown> | null = null;

  patchPrismaDelegate(t, 'product', {
    count: async (args: Record<string, unknown>) => {
      countArgs = args;
      return 1;
    },
    findMany: async (args: Record<string, unknown>) => {
      findManyArgs = args;
      return [
        {
          id: 11,
          name: 'Running Sneaker',
          photo: '/shoe.jpg',
          codeItem: 'RUN-11',
          promo: true,
          plus: false,
          price: 89.9,
          rating: 4.7,
          newArrival: true,
          available_quantity: 7,
          categoryId: 2,
          brandId: 6,
          genderId: 3,
          category: { id: 2, name: 'Scarpe' },
          brand: { id: 6, name: 'Nike' },
          gender: { id: 3, name: 'Uomo' },
        },
      ];
    },
    aggregate: async (args: Record<string, unknown>) => {
      aggregateArgs = args;
      return {
        _min: { price: 49.9 },
        _max: { price: 189.9 },
      };
    },
  } as never);

  const oversizedQuery = 'x'.repeat(160);
  const event = makeMockEvent({
    method: 'GET',
    query: {
      q: oversizedQuery,
      categories: ['2', '2', 'invalid'],
      brands: ['6'],
      priceMin: '200',
      priceMax: '50',
      inStock: 'true',
      onSale: 'true',
      page: '0',
      limit: '999',
    },
  });

  const response = await handler(event);

  assert.equal(response.products.length, 1);
  assert.equal(response.pagination.total, 1);
  assert.equal(response.pagination.page, 1);
  assert.equal(response.pagination.limit, 48);
  assert.deepEqual((findManyArgs?.orderBy as Record<string, string>) || {}, { id: 'desc' });
  assert.equal(findManyArgs?.take, 48);
  assert.equal(findManyArgs?.skip, 0);
  assert.deepEqual(findManyArgs?.where, {
    OR: [
      { name: { contains: oversizedQuery.slice(0, 120) } },
      { description: { contains: oversizedQuery.slice(0, 120) } },
    ],
    categoryId: { in: [2] },
    brandId: { in: [6] },
    price: { gte: 50, lte: 200 },
    available_quantity: { gt: 0 },
    promo: true,
  });
  assert.deepEqual(countArgs?.where, findManyArgs?.where);
  assert.deepEqual(aggregateArgs?.where, {
    OR: [
      { name: { contains: oversizedQuery.slice(0, 120) } },
      { description: { contains: oversizedQuery.slice(0, 120) } },
    ],
    categoryId: { in: [2] },
    brandId: { in: [6] },
    available_quantity: { gt: 0 },
    promo: true,
  });
  assert.deepEqual(response.facets.priceRange, {
    min: 49.9,
    max: 189.9,
  });
});

test('product detail returns the core catalog payload with relations', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/products/[id].ts', import.meta.url).href
  );

  patchPrismaDelegate(t, 'product', {
    findUnique: async () => ({
      id: 11,
      name: 'Running Sneaker',
      category: { id: 2, name: 'Scarpe' },
      subCategory: { id: 5, name: 'Running' },
      brand: { id: 6, name: 'Nike' },
      gender: { id: 3, name: 'Uomo' },
      features: [
        {
          value: '42',
          feature: { id: 9, name: 'Numero', type: 'select' },
        },
      ],
      productColors: [{ color: { id: 1, name: 'Blue', hex: '#0000FF' } }],
      images: [
        {
          id: 91,
          imageUrl: 'https://example.com/shoe.jpg',
          imageType: 'MAIN',
          color: { id: 1, name: 'Blue', hex: '#0000FF' },
        },
      ],
    }),
  } as never);

  const event = makeMockEvent({
    method: 'GET',
    params: { id: '11' },
  });

  const response = await handler(event);

  assert.equal(response.id, 11);
  assert.equal(response.category.name, 'Scarpe');
  assert.equal(response.brand.name, 'Nike');
  assert.equal(response.features[0].feature.name, 'Numero');
  assert.equal(response.images[0].imageType, 'MAIN');
});

test('orders/me rejects unauthenticated access to a protected user route', async () => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/orders/me.get.ts', import.meta.url).href
  );

  const event = makeMockEvent({
    method: 'GET',
    headers: {},
  });

  await expectStatusCode(handler, event, 401);
});

test('orders/me returns serialized orders for an authenticated customer', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/orders/me.get.ts', import.meta.url).href
  );
  const cookie = mockAuthenticatedSession(t, {
    id: 44,
    email: 'mario@example.com',
    role: 'USER',
    name: 'Mario',
    surname: 'Rossi',
    address: 'Via Roma 1',
    number: '3331234567',
  });

  patchPrismaDelegate(t, 'order', {
    findMany: async () => [createRawOrder()],
  } as never);

  const event = makeMockEvent({
    method: 'GET',
    headers: {
      cookie,
    },
  });

  const response = await handler(event);

  assert.equal(response.success, true);
  assert.equal(response.orders.length, 1);
  assert.equal(response.orders[0].customerEmail, 'mario@example.com');
  assert.equal(response.orders[0].items[0].name, 'Sneaker Runner');
  assert.equal(response.orders[0].status, 'processing');
});

test('checkout draft success path returns a serialized checkout snapshot', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/order/order.js', import.meta.url).href
  );

  let createArgs: Record<string, unknown> | null = null;
  mockPrismaTransaction(t, {
    product: {
      findMany: async () => [
        {
          id: 11,
          name: 'Sneaker Runner',
          photo: '/shoe.jpg',
          price: 55,
          available_quantity: 5,
        },
      ],
    },
    checkoutSession: {
      create: async (args: Record<string, unknown>) => {
        createArgs = args;
        return createCheckoutDraftRecord();
      },
    },
  });

  const event = makeMockEvent({
    method: 'POST',
    body: {
      name: 'Giulia',
      surname: 'Bianchi',
      email: 'Giulia@example.com',
      address: 'Via Milano 20',
      phone: '3339876543',
      products: [{ productId: 11, quantity: 2 }],
    },
  });

  const response = await handler(event);

  assert.equal(response.success, true);
  assert.equal(response.checkout.customer.email, 'giulia@example.com');
  assert.equal(response.checkout.items[0].quantity, 2);
  assert.equal(response.checkout.amounts.total, 110);
  assert.equal((createArgs?.data as Record<string, unknown>)?.userId, null);
});

test('checkout draft returns a controlled validation error when stock is insufficient', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/order/order.js', import.meta.url).href
  );

  let createCalled = false;
  mockPrismaTransaction(t, {
    product: {
      findMany: async () => [
        {
          id: 11,
          name: 'Sneaker Runner',
          photo: '/shoe.jpg',
          price: 55,
          available_quantity: 1,
        },
      ],
    },
    checkoutSession: {
      create: async () => {
        createCalled = true;
        return createCheckoutDraftRecord();
      },
    },
  });

  const event = makeMockEvent({
    method: 'POST',
    body: {
      name: 'Giulia',
      surname: 'Bianchi',
      email: 'giulia@example.com',
      address: 'Via Milano 20',
      phone: '3339876543',
      products: [{ productId: 11, quantity: 3 }],
    },
  });

  await expectStatusCode(handler, event, 400);
  assert.equal(createCalled, false);
});

test('admin orders route returns serialized data for a valid admin session', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/admin/orders.get.ts', import.meta.url).href
  );
  const cookie = mockAuthenticatedSession(t, {
    id: 1,
    email: 'admin@example.com',
    role: 'ADMIN',
    name: 'Ada',
    surname: 'Admin',
  });

  patchPrismaDelegate(t, 'order', {
    findMany: async () => [createRawOrder()],
  } as never);

  const event = makeMockEvent({
    method: 'GET',
    headers: {
      cookie,
    },
  });

  const response = await handler(event);

  assert.equal(response.success, true);
  assert.equal(response.orders.length, 1);
  assert.equal(response.orders[0].itemsCount, 1);
  assert.equal(response.orders[0].customerName, 'Mario Rossi');
  assert.equal(response.orders[0].paymentStatus, 'succeeded');
});
