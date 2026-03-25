import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'

import {
  expectStatusCode,
  installNuxtRouteStubs,
  loadRouteHandler,
  makeMockEvent,
  resetMockRuntimeConfig,
  setMockRuntimeConfig,
} from '../helpers/nuxt-route-test-utils'

installNuxtRouteStubs()

function patchGlobalFetch(t: TestContext, value: typeof globalThis.fetch) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = value
  t.after(() => {
    globalThis.fetch = originalFetch
  })
}

function patchRuntimeConfig(t: TestContext, config: Record<string, unknown>) {
  setMockRuntimeConfig(config)
  t.after(() => {
    resetMockRuntimeConfig()
  })
}

test('chat status stays disabled without probing a backend when the feature flag is off', async (t) => {
  let fetchCalled = false
  patchGlobalFetch(t, (async () => {
    fetchCalled = true
    throw new Error('fetch should not be called')
  }) as typeof globalThis.fetch)
  patchRuntimeConfig(t, {
    public: {
      aiChatEnabled: false,
      aiChatProvider: 'ollama',
    },
    aiChatEnabled: false,
    aiChatProvider: 'ollama',
  })

  const handler = await loadRouteHandler(
    new URL('../../server/api/chat/status.get.ts', import.meta.url).href
  )

  const response = await handler(makeMockEvent({ method: 'GET' }))

  assert.deepEqual(response, {
    enabled: false,
    available: false,
    provider: 'ollama',
    reason: 'disabled',
  })
  assert.equal(fetchCalled, false)
})

test('chat status probes the configured backend URL instead of a hardcoded localhost endpoint', async (t) => {
  let requestedUrl = ''
  patchGlobalFetch(
    t,
    (async (input: RequestInfo | URL) => {
      requestedUrl = String(input)
      return new Response(JSON.stringify({ models: [{ name: 'llama3.2:1b' }] }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      })
    }) as typeof globalThis.fetch
  )
  patchRuntimeConfig(t, {
    public: {
      aiChatEnabled: true,
      aiChatProvider: 'ollama',
    },
    aiChatEnabled: true,
    aiChatProvider: 'ollama',
    aiChatBaseUrl: 'http://ollama.internal:11434',
    aiChatTimeoutMs: 1500,
  })

  const handler = await loadRouteHandler(
    new URL('../../server/api/chat/status.get.ts', import.meta.url).href
  )

  const response = await handler(makeMockEvent({ method: 'GET' }))

  assert.equal(requestedUrl, 'http://ollama.internal:11434/api/tags')
  assert.deepEqual(response, {
    enabled: true,
    available: true,
    provider: 'ollama',
    reason: 'ready',
  })
})

test('chat message route returns a safe 503 when AI chat is disabled', async (t) => {
  patchRuntimeConfig(t, {
    public: {
      aiChatEnabled: false,
      aiChatProvider: 'ollama',
    },
    aiChatEnabled: false,
    aiChatProvider: 'ollama',
  })

  const handler = await loadRouteHandler(
    new URL('../../server/api/chat/ollama.post.ts', import.meta.url).href
  )

  await expectStatusCode(
    handler,
    makeMockEvent({
      method: 'POST',
      body: {
        message: 'Ciao',
      },
    }),
    503
  )
})
