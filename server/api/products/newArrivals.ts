import { buildCacheKey, rememberCache } from '../../utils/cache';
import prisma from '../../utils/prisma';

const NEW_ARRIVALS_CACHE_KEY = buildCacheKey('products:new-arrivals');

export default defineEventHandler(async () => {
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
});
