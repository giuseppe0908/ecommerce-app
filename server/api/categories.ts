import { z } from 'zod';
import { requireAdminUser } from '../utils/auth-session';
import { buildCacheKey, deleteCacheByPrefix, rememberCache } from '../utils/cache';
import { createLogger } from '../utils/observability';
import { shouldServePreviewEmptyCollectionFallback } from '../utils/preview-read-fallback';
import prisma from '../utils/prisma';

const CATEGORIES_CACHE_PREFIX = 'categories:';
const CATEGORIES_LIST_CACHE_KEY = buildCacheKey(`${CATEGORIES_CACHE_PREFIX}list`);
const PRODUCTS_CACHE_PREFIX = 'products:';
const logger = createLogger('categories');
const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        genderId: z.coerce.number().int().positive(),
      })
    )
    .optional(),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    try {
      const { value: categories } = await rememberCache(
        CATEGORIES_LIST_CACHE_KEY,
        60 * 5,
        () =>
          prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
              images: true,
              subCategories: {
                orderBy: { name: 'asc' },
              },
            },
          })
      );
      return categories;
    } catch (error) {
      if (shouldServePreviewEmptyCollectionFallback()) {
        logger.warn('Fallback categorie vuote in preview senza DB remoto', {
          requestId: event.context.requestId,
          error,
        });
        return [];
      }

      throw error;
    }
  } else if (method === 'POST') {
    await requireAdminUser(event);

    const body = await readBody(event);
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload categoria non valido',
        data: parsed.error.format(),
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name: parsed.data.name },
      select: { id: true },
    });
    if (existingCategory) {
      throw createError({ statusCode: 409, message: 'Categoria gia esistente' });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: parsed.data.name,
        ...(parsed.data.images?.length
          ? {
              images: {
                create: parsed.data.images,
              },
            }
          : {}),
      },
      include: {
        images: true,
      },
    });
    await deleteCacheByPrefix(CATEGORIES_CACHE_PREFIX);
    await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
    setResponseStatus(event, 201);
    return newCategory;
  }

  throw createError({ statusCode: 405, message: 'Metodo non supportato' });
});
