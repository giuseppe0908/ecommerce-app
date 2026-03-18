import { z } from 'zod';
import { requireAdminUser } from '../utils/auth-session';
import { buildCacheKey, deleteCacheByPrefix, rememberCache } from '../utils/cache';
import { createLogger } from '../utils/observability';
import { shouldServePreviewEmptyCollectionFallback } from '../utils/preview-read-fallback';
import prisma from '../utils/prisma';

const BRANDS_CACHE_PREFIX = 'brands:';
const BRANDS_LIST_CACHE_KEY = buildCacheKey(`${BRANDS_CACHE_PREFIX}list`);
const PRODUCTS_CACHE_PREFIX = 'products:';
const logger = createLogger('brands');
const createBrandSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    try {
      const { value: brands } = await rememberCache(
        BRANDS_LIST_CACHE_KEY,
        60 * 5,
        () =>
          prisma.brand.findMany({
            orderBy: { name: 'asc' },
          })
      );
      return brands;
    } catch (error) {
      if (shouldServePreviewEmptyCollectionFallback()) {
        logger.warn('Fallback brand vuoti in preview senza DB remoto', {
          requestId: event.context.requestId,
          error,
        });
        return [];
      }

      throw error;
    }
  }

  if (method === 'POST') {
    await requireAdminUser(event);

    const body = await readBody(event);
    const parsedBody = createBrandSchema.safeParse(body);
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload brand non valido',
        data: parsedBody.error.format(),
      });
    }

    const name = parsedBody.data.name;
    const existingBrand = await prisma.brand.findFirst({
      where: { name },
      select: { id: true },
    });

    if (existingBrand) {
      throw createError({ statusCode: 409, message: 'Brand gia esistente' });
    }

    const newBrand = await prisma.brand.create({
      data: { name },
    });

    await deleteCacheByPrefix(BRANDS_CACHE_PREFIX);
    await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
    setResponseStatus(event, 201);
    return newBrand;
  }

  throw createError({ statusCode: 405, message: 'Metodo non supportato' });
});
