const FALLBACK_SITE_URL = 'http://localhost:3000'

export function normalizeBaseUrl(value?: string | null) {
  const normalized = String(value || '').trim().replace(/\/+$/, '')
  return normalized || FALLBACK_SITE_URL
}

export function normalizeSeoPath(value?: string | null) {
  const rawPath = String(value || '/')
  const [pathname] = rawPath.split(/[?#]/)
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  const normalized = withLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '')
  return normalized || '/'
}

export function buildCanonicalUrl(baseUrl?: string | null, path?: string | null) {
  return `${normalizeBaseUrl(baseUrl)}${normalizeSeoPath(path)}`
}

export function toAbsoluteUrl(baseUrl?: string | null, value?: string | null) {
  const rawValue = String(value || '').trim()
  if (!rawValue) return ''
  if (/^https?:\/\//i.test(rawValue)) return rawValue
  if (rawValue.startsWith('//')) return `https:${rawValue}`
  return `${normalizeBaseUrl(baseUrl)}${rawValue.startsWith('/') ? rawValue : `/${rawValue}`}`
}

export function truncateText(value?: string | null, maxLength = 160) {
  const cleanText = String(value || '').replace(/\s+/g, ' ').trim()
  if (!cleanText) return ''
  if (cleanText.length <= maxLength) return cleanText
  return `${cleanText.slice(0, maxLength - 1).trimEnd()}…`
}

export function buildRobotsValue(options?: { index?: boolean; follow?: boolean }) {
  const { index = true, follow = true } = options || {}
  return `${index ? 'index' : 'noindex'},${follow ? 'follow' : 'nofollow'}`
}

export function escapeXml(value?: string | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
