import prisma from '~/server/utils/prisma'
import { buildCanonicalUrl, escapeXml, normalizeBaseUrl } from '~/utils/seo'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const requestUrl = getRequestURL(event)
  const baseUrl = normalizeBaseUrl(config.public.appBaseUrl || requestUrl.origin)

  const products = await prisma.product.findMany({
    select: {
      id: true,
    },
    orderBy: {
      id: 'desc',
    },
  })

  const urls = [
    { loc: buildCanonicalUrl(baseUrl, '/') },
    { loc: buildCanonicalUrl(baseUrl, '/product') },
    ...products.map((product: { id: number }) => ({
      loc: buildCanonicalUrl(baseUrl, `/product/${product.id}`),
    })),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (entry) => [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        '  </url>',
      ].join('\n')
    ),
    '</urlset>',
  ].join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  return xml
})
