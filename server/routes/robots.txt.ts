import { buildCanonicalUrl, normalizeBaseUrl } from '~/utils/seo'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const requestUrl = getRequestURL(event)
  const baseUrl = normalizeBaseUrl(config.public.appBaseUrl || requestUrl.origin)

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /dashboard',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgotPassword',
    'Disallow: /reset-password',
    'Disallow: /authcallback',
    'Disallow: /order',
    'Disallow: /payment',
    'Disallow: /order/success',
    'Disallow: /api/',
    `Sitemap: ${buildCanonicalUrl(baseUrl, '/sitemap.xml')}`,
  ].join('\n')
})
