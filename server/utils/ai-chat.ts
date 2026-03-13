function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value !== 'string') return fallback

  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off', ''].includes(normalized)) return false
  return fallback
}

function parseTimeout(value: unknown, fallback = 3000) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.trunc(parsed), 500), 15000)
}

function normalizeBaseUrl(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\/+$/, '')
}

function getConfigValue(config: Record<string, unknown>, key: string) {
  if (key in config) {
    return config[key]
  }

  const publicConfig =
    config.public && typeof config.public === 'object'
      ? (config.public as Record<string, unknown>)
      : {}

  return publicConfig[key]
}

export function getAiChatRuntimeConfig(event?: unknown) {
  const config = useRuntimeConfig(event as never) as Record<string, unknown>
  const enabled = parseBoolean(getConfigValue(config, 'aiChatEnabled'), false)
  const provider = String(getConfigValue(config, 'aiChatProvider') || 'ollama').trim().toLowerCase()
  const model = String(getConfigValue(config, 'aiChatModel') || 'llama3.2:1b').trim()
  const baseUrl = normalizeBaseUrl(getConfigValue(config, 'aiChatBaseUrl'))
  const timeoutMs = parseTimeout(getConfigValue(config, 'aiChatTimeoutMs'), 3000)

  return {
    enabled,
    provider,
    model,
    baseUrl,
    timeoutMs,
    configured: enabled && provider === 'ollama' && baseUrl.length > 0,
  }
}

function buildAiChatUrl(baseUrl: string, pathname: string) {
  return new URL(pathname, `${baseUrl}/`).toString()
}

function isAiChatStatusError(error: unknown): error is { statusCode: number } {
  return typeof error === 'object' && error !== null && 'statusCode' in error
}

export function createAiChatUnavailableError() {
  return createError({
    statusCode: 503,
    statusMessage: 'Assistente AI temporaneamente non disponibile',
  })
}

export function getAiChatGenerateUrl(event?: unknown) {
  const config = getAiChatRuntimeConfig(event)
  if (!config.enabled || !config.configured) {
    throw createAiChatUnavailableError()
  }

  if (config.provider !== 'ollama') {
    throw createAiChatUnavailableError()
  }

  return buildAiChatUrl(config.baseUrl, '/api/generate')
}

export async function probeAiChatAvailability(event?: unknown) {
  const config = getAiChatRuntimeConfig(event)

  if (!config.enabled) {
    return {
      enabled: false,
      available: false,
      provider: config.provider,
      reason: 'disabled',
    }
  }

  if (config.provider !== 'ollama') {
    return {
      enabled: true,
      available: false,
      provider: config.provider,
      reason: 'unsupported_provider',
    }
  }

  if (!config.baseUrl) {
    return {
      enabled: true,
      available: false,
      provider: config.provider,
      reason: 'misconfigured',
    }
  }

  try {
    const response = await fetch(buildAiChatUrl(config.baseUrl, '/api/tags'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(config.timeoutMs),
    })

    if (!response.ok) {
      return {
        enabled: true,
        available: false,
        provider: config.provider,
        reason: 'backend_error',
      }
    }

    const data = (await response.json()) as { models?: Array<{ name?: string }> }

    return {
      enabled: true,
      available: Array.isArray(data.models) && data.models.length > 0,
      provider: config.provider,
      reason: Array.isArray(data.models) && data.models.length > 0 ? 'ready' : 'no_models',
    }
  } catch (error) {
    if (isAiChatStatusError(error)) {
      throw error
    }

    return {
      enabled: true,
      available: false,
      provider: config.provider,
      reason: 'unreachable',
    }
  }
}
