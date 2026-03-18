import { buildCacheKey, rememberCache } from '../utils/cache'
import { createLogger } from '../utils/observability'
import prisma from '../utils/prisma'

const logger = createLogger('quick-search')

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = typeof query.q === 'string' ? query.q.trim() : ''
  
  if (!searchTerm || searchTerm.length < 2) {
    return { products: [], brands: [] }
  }

  const cacheKey = buildCacheKey('products:quick-search', { searchTerm })

  try {
    const { value: results } = await rememberCache(cacheKey, 30, () =>
      prisma.$transaction([
        // Cerca nei prodotti
        prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          include: {
            brand: true,
            category: true
          },
          take: 5
        }),
        // Cerca nei brand
        prisma.brand.findMany({
          where: {
            name: { contains: searchTerm, mode: 'insensitive' }
          },
          take: 3
        })
      ])
    )

    return {
      products: results[0],
      brands: results[1]
    }
  } catch (error) {
    logger.error('Errore quick search', {
      requestId: event.context.requestId,
      error,
      searchTerm,
    })
    return { products: [], brands: [], error: 'Errore durante la ricerca' }
  }
})
