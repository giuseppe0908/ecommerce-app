import { buildCacheKey, rememberCache } from '../../utils/cache';
import { createLogger } from '../../utils/observability';
import { shouldServePreviewEmptyCollectionFallback } from '../../utils/preview-read-fallback';
import prisma from '../../utils/prisma';

const NEW_ARRIVALS_CACHE_KEY = buildCacheKey('products:new-arrivals');
const logger = createLogger('products-new-arrivals');

export default defineEventHandler(async () => {
  try {
    const { value: products } = await rememberCache(NEW_ARRIVALS_CACHE_KEY, 90, () =>
      prisma.product.findMany({
        where: {
          newArrival: true,
        },
        include: {
          category: true,
          brand: true,
          gender: true,
        },
        // orderBy: {
        //   createdAt: 'desc', // Per mostrare i più recenti per primi
        // },
      })
    );

    return products;
  } catch (error) {
    if (shouldServePreviewEmptyCollectionFallback()) {
      logger.warn('Fallback nuovi arrivi vuoti in preview senza DB remoto', {
        error,
      });
      return [];
    }

    throw error;
  }
});
