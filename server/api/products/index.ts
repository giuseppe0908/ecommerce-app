import { z } from 'zod';
import { requireAdminUser } from '../../utils/auth-session';
import { buildCacheKey, deleteCacheByPrefix, rememberCache } from '../../utils/cache';
import { createLogger } from '../../utils/observability';
import prisma from '../../utils/prisma';

const PRODUCTS_CACHE_PREFIX = 'products:';
const PRODUCTS_LIST_CACHE_NAMESPACE = `${PRODUCTS_CACHE_PREFIX}list`;
const logger = createLogger('products');

const booleanInputSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0' || normalized === '') return false;
  }
  return value;
}, z.boolean());

const createProductSchema = z.object({
  name: z.string().trim().min(3).max(255),
  price: z.coerce.number().positive(),
  categoryId: z.coerce.number().int().positive(),
  brandId: z.coerce.number().int().positive(),
  genderId: z.coerce.number().int().positive(),
  favorite: booleanInputSchema.optional().default(false),
  promo: booleanInputSchema.optional().default(false),
  plus: booleanInputSchema.optional().default(false),
  newArrival: booleanInputSchema.optional().default(false),
  photo: z.string().trim().min(1),
  codeItem: z.string().trim().min(1).max(100),
  percentualPromo: z.coerce.number().min(0).max(100),
  rating: z.coerce.number().min(0).max(5).optional(),
  description: z.string().trim().min(1),
  available_quantity: z.coerce.number().int().min(0),
  subCategoryId: z.coerce.number().int().positive().nullable().optional(),
});

const deleteProductSchema = z.object({
  id: z.coerce.number().int().positive(),
});

async function assertSubCategoryBelongsToCategory(
  categoryId: number,
  subCategoryId: number | null | undefined
) {
  if (!subCategoryId) return;

  const subCategory = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
    select: { id: true, categoryId: true },
  });

  if (!subCategory) {
    throw createError({ statusCode: 400, message: 'Sottocategoria non valida' });
  }

  if (subCategory.categoryId !== categoryId) {
    throw createError({
      statusCode: 400,
      message: 'La sottocategoria non appartiene alla categoria selezionata',
    });
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  let priceFilter = {};
  if (query.priceMin) {
    priceFilter = { ...priceFilter, gte: Number.parseFloat(String(query.priceMin)) };
  }
  if (query.priceMax) {
    priceFilter = { ...priceFilter, lte: Number.parseFloat(String(query.priceMax)) };
  }

  const filters = {
    ...(query.category && !Number.isNaN(Number.parseInt(String(query.category), 10)) && {
      categoryId: Number.parseInt(String(query.category), 10),
    }),
    ...(query.brand && !Number.isNaN(Number.parseInt(String(query.brand), 10)) && {
      brandId: Number.parseInt(String(query.brand), 10),
    }),
    ...(query.gender && !Number.isNaN(Number.parseInt(String(query.gender), 10)) && {
      genderId: Number.parseInt(String(query.gender), 10),
    }),
    ...(query.newArrivals === 'true' && { newArrival: true }),
    ...(query.promo === 'true' && { promo: true }),
    ...(query.plus === 'true' && { plus: true }),
    ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
  };

  const method = event.node.req.method;
  if (method === 'GET') {
    const cacheKey = buildCacheKey(PRODUCTS_LIST_CACHE_NAMESPACE, query);
    const { value: products } = await rememberCache(cacheKey, 60, () =>
      Object.keys(filters).length === 0
        ? prisma.product.findMany({
            include: {
              category: true,
              brand: true,
              gender: true,
              subCategory: true,
            },
          })
        : prisma.product.findMany({
            where: filters,
            include: {
              category: true,
              brand: true,
              gender: true,
              subCategory: true,
            },
          })
    );

    return products;
  }

  if (method === 'POST') {
    await requireAdminUser(event);

    const body = await readBody(event);
    const parsedBody = createProductSchema.safeParse(body);
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload prodotto non valido',
        data: parsedBody.error.format(),
      });
    }

    await assertSubCategoryBelongsToCategory(
      parsedBody.data.categoryId,
      parsedBody.data.subCategoryId
    );

    const newProduct = await prisma.product.create({
      data: parsedBody.data,
    });
    await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
    setResponseStatus(event, 201);
    return newProduct;
  }

  if (method === 'DELETE') {
    await requireAdminUser(event);

    const body = await readBody(event);
    const parsedBody = deleteProductSchema.safeParse(body);
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload eliminazione prodotto non valido',
        data: parsedBody.error.format(),
      });
    }

    try {
      await prisma.product.delete({
        where: { id: parsedBody.data.id },
      });
      await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
      return { success: true };
    } catch (error) {
      logger.error('Errore eliminazione prodotto', {
        requestId: event.context.requestId,
        error,
        productId: parsedBody.data.id,
      });
      throw createError({ statusCode: 500, statusMessage: 'Error deleting product' });
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});
