import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'

import prisma from '../../server/utils/prisma'
import { installNuxtRouteStubs, loadRouteHandler, makeMockEvent } from '../helpers/nuxt-route-test-utils'

installNuxtRouteStubs()

function patchProperty<T extends object, K extends keyof T>(
  t: TestContext,
  target: T,
  key: K,
  value: T[K]
) {
  const descriptor = Object.getOwnPropertyDescriptor(target, key)
  Object.defineProperty(target, key, {
    configurable: true,
    writable: true,
    value,
  })

  t.after(() => {
    if (descriptor) {
      Object.defineProperty(target, key, descriptor)
      return
    }

    delete (target as Record<string, unknown>)[String(key)]
  })
}

function patchEnv(t: TestContext, key: string, value: string | undefined) {
  const previousValue = process.env[key]

  if (value === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }

  t.after(() => {
    if (previousValue === undefined) {
      delete process.env[key]
      return
    }

    process.env[key] = previousValue
  })
}

test('categories GET falls back to an empty list on preview when the database URL is still local', async (t) => {
  patchEnv(t, 'VERCEL_ENV', 'preview')
  patchEnv(t, 'DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5432/db_ecommerce_preview')
  patchProperty(t, prisma, 'category', {
    findMany: async () => {
      throw new Error('database unavailable')
    },
  } as never)

  const handler = await loadRouteHandler(
    new URL('../../server/api/categories.ts', import.meta.url).href
  )

  const response = await handler(
    makeMockEvent({
      method: 'GET',
    })
  )

  assert.deepEqual(response, [])
})

test('new arrivals GET falls back to an empty list on preview when the database URL is still local', async (t) => {
  patchEnv(t, 'VERCEL_ENV', 'preview')
  patchEnv(t, 'DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5432/db_ecommerce_preview')
  patchProperty(t, prisma, 'product', {
    findMany: async () => {
      throw new Error('database unavailable')
    },
  } as never)

  const handler = await loadRouteHandler(
    new URL('../../server/api/products/newArrivals.ts', import.meta.url).href
  )

  const response = await handler(makeMockEvent({ method: 'GET' }))

  assert.deepEqual(response, [])
})
