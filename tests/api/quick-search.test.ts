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

test('quick search returns products and brands with case-insensitive Postgres filters', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/search.js', import.meta.url).href
  )

  let productArgs: Record<string, unknown> | null = null
  let brandArgs: Record<string, unknown> | null = null

  patchProperty(t, prisma, 'product', {
    findMany: async (args: Record<string, unknown>) => {
      productArgs = args
      return [
        {
          id: 11,
          name: 'Felpa Sportiva',
          description: 'Felpa in cotone',
          brand: { id: 2, name: 'ActiveWear' },
          category: { id: 4, name: 'Felpe' },
        },
      ]
    },
  } as never)

  patchProperty(t, prisma, 'brand', {
    findMany: async (args: Record<string, unknown>) => {
      brandArgs = args
      return [{ id: 2, name: 'Felpa Lab' }]
    },
  } as never)

  patchProperty(
    t,
    prisma,
    '$transaction',
    (async (operations: unknown[]) => Promise.all(operations)) as (typeof prisma)['$transaction']
  )

  const response = await handler(
    makeMockEvent({
      method: 'GET',
      query: {
        q: 'felpa',
      },
    })
  )

  assert.equal(response.products.length, 1)
  assert.equal(response.brands.length, 1)
  assert.deepEqual(productArgs?.where, {
    OR: [
      { name: { contains: 'felpa', mode: 'insensitive' } },
      { description: { contains: 'felpa', mode: 'insensitive' } },
    ],
  })
  assert.deepEqual(brandArgs?.where, {
    name: { contains: 'felpa', mode: 'insensitive' },
  })
})

test('quick search skips Prisma queries for short search terms', async (t) => {
  const handler = await loadRouteHandler(
    new URL('../../server/api/search.js', import.meta.url).href
  )

  let transactionCalled = false
  patchProperty(
    t,
    prisma,
    '$transaction',
    (async () => {
      transactionCalled = true
      return []
    }) as (typeof prisma)['$transaction']
  )

  const response = await handler(
    makeMockEvent({
      method: 'GET',
      query: {
        q: 'f',
      },
    })
  )

  assert.deepEqual(response, {
    products: [],
    brands: [],
  })
  assert.equal(transactionCalled, false)
})
