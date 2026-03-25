import assert from 'node:assert/strict';
import test from 'node:test';

import { CheckoutStatus, PaymentStatus } from '@prisma/client';

import {
  buildPaymentIntentIdempotencyKey,
  finalizeCheckoutSession,
  syncCheckoutPaymentState,
} from '../../server/utils/checkout';
import prisma from '../../server/utils/prisma';

function createCheckoutSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'chk_test',
    userId: null,
    orderId: null,
    customerName: 'Mario',
    customerSurname: 'Rossi',
    customerEmail: 'mario.rossi@example.com',
    shippingAddress: 'Via Roma 1',
    customerPhone: '123456789',
    currency: 'eur',
    subtotal: 120,
    shippingAmount: 0,
    totalAmount: 120,
    status: CheckoutStatus.PAYMENT_PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentIntentId: 'pi_current',
    expiresAt: new Date(Date.now() + 60_000),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: null,
    items: [
      {
        id: 1,
        checkoutSessionId: 'chk_test',
        productId: 10,
        quantity: 1,
        unitPrice: 120,
        productName: 'Sneaker',
        productPhoto: null,
        product: {
          id: 10,
          name: 'Sneaker',
          photo: '/shoe.jpg',
          price: 120,
        },
      },
    ],
    ...overrides,
  } as any;
}

async function withMockedTransaction<T>(
  transactionImpl: (callback: (tx: any) => Promise<unknown>) => Promise<unknown>,
  run: () => Promise<T>
) {
  const originalTransaction = (prisma as any).$transaction;
  (prisma as any).$transaction = transactionImpl;

  try {
    return await run();
  } finally {
    (prisma as any).$transaction = originalTransaction;
  }
}

test('buildPaymentIntentIdempotencyKey is deterministic for first attempt and retries', () => {
  assert.equal(buildPaymentIntentIdempotencyKey('chk_1', null), 'checkout-chk_1');
  assert.equal(
    buildPaymentIntentIdempotencyKey('chk_1', 'pi_old'),
    'checkout-chk_1-retry-pi_old'
  );
});

test('syncCheckoutPaymentState ignores stale payment intent updates', async () => {
  const checkoutSession = createCheckoutSession();
  let updateCalled = false;

  const result = await withMockedTransaction(
    async (callback) =>
      callback({
        checkoutSession: {
          findUnique: async () => checkoutSession,
          update: async () => {
            updateCalled = true;
            return checkoutSession;
          },
        },
      }),
    async () =>
      syncCheckoutPaymentState('chk_test', 'pi_stale', PaymentStatus.CANCELLED)
  );

  assert.equal(updateCalled, false);
  assert.equal(result.paymentIntentId, 'pi_current');
  assert.equal(result.status, CheckoutStatus.PAYMENT_PENDING);
});

test('syncCheckoutPaymentState expires a stale checkout instead of reopening it', async () => {
  const expiredCheckout = createCheckoutSession({
    status: CheckoutStatus.OPEN,
    paymentIntentId: null,
    expiresAt: new Date(Date.now() - 1_000),
  });

  const result = await withMockedTransaction(
    async (callback) =>
      callback({
        checkoutSession: {
          findUnique: async () => expiredCheckout,
          update: async ({ data }: { data: { status: CheckoutStatus } }) => ({
            ...expiredCheckout,
            status: data.status,
          }),
        },
      }),
    async () =>
      syncCheckoutPaymentState('chk_test', 'pi_current', PaymentStatus.PROCESSING)
  );

  assert.equal(result.status, CheckoutStatus.EXPIRED);
});

test('finalizeCheckoutSession rejects mismatched payment intents before reserving stock', async () => {
  const checkoutSession = createCheckoutSession();
  let reserveCalled = false;

  await withMockedTransaction(
    async (callback) =>
      callback({
        checkoutSession: {
          findUnique: async () => checkoutSession,
        },
        product: {
          updateMany: async () => {
            reserveCalled = true;
            return { count: 1 };
          },
        },
      }),
    async () => {
      await assert.rejects(
        () => finalizeCheckoutSession('chk_test', 'pi_stale'),
        (error: any) => error?.statusCode === 409
      );
    }
  );

  assert.equal(reserveCalled, false);
});

test('finalizeCheckoutSession fails with 409 when atomic stock reservation cannot be completed', async () => {
  const checkoutSession = createCheckoutSession();

  await withMockedTransaction(
    async (callback) =>
      callback({
        checkoutSession: {
          findUnique: async () => checkoutSession,
        },
        product: {
          findMany: async () => [
            {
              id: 10,
              name: 'Sneaker',
              photo: '/shoe.jpg',
              price: 120,
              available_quantity: 5,
            },
          ],
          updateMany: async () => ({ count: 0 }),
        },
        user: {
          findUnique: async () => ({
            id: 99,
            email: checkoutSession.customerEmail,
          }),
          update: async () => ({
            id: 99,
            email: checkoutSession.customerEmail,
          }),
        },
        order: {
          create: async () => {
            throw new Error('order.create should not be called when stock reservation fails');
          },
        },
      }),
    async () => {
      await assert.rejects(
        () => finalizeCheckoutSession('chk_test', 'pi_current'),
        (error: any) =>
          error?.statusCode === 409 &&
          String(error?.message || '').includes('Quantita non piu disponibile')
      );
    }
  );
});

test('finalizeCheckoutSession is idempotent when the checkout already has an order', async () => {
  const checkoutSession = createCheckoutSession({
    status: CheckoutStatus.COMPLETED,
    paymentStatus: PaymentStatus.SUCCEEDED,
    orderId: 501,
    order: {
      id: 501,
      status: 'PROCESSING',
      paymentStatus: 'SUCCEEDED',
    },
  });
  let orderCreateCalled = false;

  const result = await withMockedTransaction(
    async (callback) =>
      callback({
        checkoutSession: {
          findUnique: async () => checkoutSession,
        },
        product: {
          updateMany: async () => {
            throw new Error('product.updateMany should not be called for completed checkouts');
          },
        },
        order: {
          create: async () => {
            orderCreateCalled = true;
            return checkoutSession.order;
          },
        },
      }),
    async () => finalizeCheckoutSession('chk_test', 'pi_current')
  );

  assert.equal(orderCreateCalled, false);
  assert.equal(result.alreadyFinalized, true);
  assert.equal(result.order.id, 501);
});
