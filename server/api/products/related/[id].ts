import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createLogger } from '../../../utils/observability';
import { buildCacheKey, rememberCache } from '../../../utils/cache';
import prisma from '../../../utils/prisma';
const logger = createLogger('products-related');
const MAX_CANDIDATES = 24;
const MAX_RESULTS = 8;

const productIdSchema = z.coerce.number().int().positive();

const relatedProductSelect = {
  id: true,
  name: true,
  photo: true,
  codeItem: true,
  promo: true,
  plus: true,
  price: true,
  rating: true,
  description: true,
  categoryId: true,
  brandId: true,
  genderId: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
  gender: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ProductSelect;

type RelatedProduct = Prisma.ProductGetPayload<{ select: typeof relatedProductSelect }>;
type ScoredRelatedProduct = RelatedProduct & { relevanceScore: number };

function scoreRelatedProduct(product: RelatedProduct, currentProduct: { categoryId: number; brandId: number; genderId: number }) {
  let relevanceScore = 0;

  if (product.categoryId === currentProduct.categoryId) relevanceScore += 3;
  if (product.brandId === currentProduct.brandId) relevanceScore += 2;
  if (product.genderId === currentProduct.genderId) relevanceScore += 1;
  if (product.promo) relevanceScore += 0.5;
  if (product.rating) relevanceScore += Math.min(product.rating, 5) / 10;

  return relevanceScore;
}

export default defineEventHandler(async (event) => {
  const parsedProductId = productIdSchema.safeParse(event.context.params?.id);
  if (!parsedProductId.success) {
    throw createError({
      statusCode: 400,
      message: 'ID prodotto non valido',
    });
  }

  const productId = parsedProductId.data;
  const cacheKey = buildCacheKey('products:related', { productId });

  try {
    const { value: relatedProducts } = await rememberCache(cacheKey, 180, async () => {
      const currentProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          categoryId: true,
          brandId: true,
          genderId: true,
        },
      });

      if (!currentProduct) {
        throw createError({
          statusCode: 404,
          message: 'Prodotto non trovato',
        });
      }

      const relatedCandidates = await prisma.product.findMany({
        where: {
          id: { not: currentProduct.id },
          available_quantity: { gt: 0 },
          OR: [
            { categoryId: currentProduct.categoryId },
            { brandId: currentProduct.brandId },
            { genderId: currentProduct.genderId },
          ],
        },
        select: relatedProductSelect,
        orderBy: [
          { promo: 'desc' },
          { newArrival: 'desc' },
          { rating: 'desc' },
          { id: 'desc' },
        ],
        take: MAX_CANDIDATES,
      });

      return relatedCandidates
        .map((product: RelatedProduct) => ({
          ...product,
          relevanceScore: scoreRelatedProduct(product, currentProduct),
        }) as ScoredRelatedProduct)
        .sort((a: ScoredRelatedProduct, b: ScoredRelatedProduct) => b.relevanceScore - a.relevanceScore)
        .slice(0, MAX_RESULTS)
        .map(({ relevanceScore, ...product }: ScoredRelatedProduct) => product);
    });

    return relatedProducts;
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore recupero prodotti correlati', {
      requestId: event.context.requestId,
      error,
      productId,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei prodotti correlati',
    });
  }
});
