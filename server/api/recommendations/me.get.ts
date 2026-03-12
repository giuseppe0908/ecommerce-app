import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { requireAuthenticatedUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';

const logger = createLogger('recommendations-me');

const recommendationProductSelect = {
  id: true,
  name: true,
  price: true,
  photo: true,
  promo: true,
  newArrival: true,
  rating: true,
  available_quantity: true,
  brand: {
    select: {
      name: true,
    },
  },
  categoryId: true,
  brandId: true,
  genderId: true,
} satisfies Prisma.ProductSelect;

type RecommendationProduct = Prisma.ProductGetPayload<{
  select: typeof recommendationProductSelect;
}>;
type UserInteractionRecord = {
  productId: number;
  product: {
    categoryId: number | null;
    brandId: number | null;
    genderId: number | null;
  };
};

function mapRecommendationProduct(product: RecommendationProduct) {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price ?? 0),
    image: product.photo,
    brand: product.brand,
    promo: product.promo,
    newArrival: product.newArrival,
    rating: Number(product.rating ?? 0),
  };
}

function buildWeightedIds(values: Array<number | null | undefined>, weight: number, store: Map<number, number>) {
  for (const value of values) {
    if (!value || !Number.isInteger(value)) continue;
    store.set(value, (store.get(value) || 0) + weight);
  }
}

function getTopIds(weightedMap: Map<number, number>, limit = 3) {
  return Array.from(weightedMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([id]) => id);
}

function buildProductWhereClause(excludedProductIds: number[], preferredIds: {
  categoryIds: number[];
  brandIds: number[];
  genderIds: number[];
}) {
  const orConditions: Prisma.ProductWhereInput[] = [];

  if (preferredIds.categoryIds.length > 0) {
    orConditions.push({ categoryId: { in: preferredIds.categoryIds } });
  }

  if (preferredIds.brandIds.length > 0) {
    orConditions.push({ brandId: { in: preferredIds.brandIds } });
  }

  if (preferredIds.genderIds.length > 0) {
    orConditions.push({ genderId: { in: preferredIds.genderIds } });
  }

  if (orConditions.length === 0) {
    orConditions.push({ promo: true }, { newArrival: true }, { rating: { gte: 4 } });
  }

  return {
    available_quantity: { gt: 0 },
    ...(excludedProductIds.length > 0
      ? {
          id: {
            notIn: excludedProductIds,
          },
        }
      : {}),
    OR: orConditions,
  } satisfies Prisma.ProductWhereInput;
}

export default defineEventHandler(async (event) => {
  const authUser = await requireAuthenticatedUser(event);

  try {
    const [favorites, orderedProducts]: [UserInteractionRecord[], UserInteractionRecord[]] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: authUser.id },
        select: {
          productId: true,
          product: {
            select: {
              categoryId: true,
              brandId: true,
              genderId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      prisma.orderProduct.findMany({
        where: {
          order: {
            idUtente: authUser.id,
            paymentStatus: PaymentStatus.SUCCEEDED,
            status: {
              not: OrderStatus.CANCELLED,
            },
          },
        },
        select: {
          productId: true,
          product: {
            select: {
              categoryId: true,
              brandId: true,
              genderId: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
        take: 24,
      }),
    ]);

    const excludedProductIds = Array.from(
      new Set([
        ...favorites.map((favorite: UserInteractionRecord) => favorite.productId),
        ...orderedProducts.map((orderItem: UserInteractionRecord) => orderItem.productId),
      ])
    );

    const categoryWeights = new Map<number, number>();
    const brandWeights = new Map<number, number>();
    const genderWeights = new Map<number, number>();

    buildWeightedIds(
      favorites.map((favorite: UserInteractionRecord) => favorite.product.categoryId),
      3,
      categoryWeights
    );
    buildWeightedIds(
      orderedProducts.map((orderItem: UserInteractionRecord) => orderItem.product.categoryId),
      1,
      categoryWeights
    );

    buildWeightedIds(
      favorites.map((favorite: UserInteractionRecord) => favorite.product.brandId),
      3,
      brandWeights
    );
    buildWeightedIds(
      orderedProducts.map((orderItem: UserInteractionRecord) => orderItem.product.brandId),
      1,
      brandWeights
    );

    buildWeightedIds(
      favorites.map((favorite: UserInteractionRecord) => favorite.product.genderId),
      2,
      genderWeights
    );
    buildWeightedIds(
      orderedProducts.map((orderItem: UserInteractionRecord) => orderItem.product.genderId),
      1,
      genderWeights
    );

    const preferredIds = {
      categoryIds: getTopIds(categoryWeights),
      brandIds: getTopIds(brandWeights),
      genderIds: getTopIds(genderWeights),
    };

    const primaryRecommendations = await prisma.product.findMany({
      where: buildProductWhereClause(excludedProductIds, preferredIds),
      select: recommendationProductSelect,
      orderBy: [{ promo: 'desc' }, { newArrival: 'desc' }, { rating: 'desc' }, { id: 'desc' }],
      take: 6,
    });

    const collectedIds = new Set<number>([
      ...excludedProductIds,
      ...primaryRecommendations.map((product: RecommendationProduct) => product.id),
    ]);

    let fallbackRecommendations: RecommendationProduct[] = [];

    if (primaryRecommendations.length < 6) {
      fallbackRecommendations = await prisma.product.findMany({
        where: {
          available_quantity: { gt: 0 },
          id: {
            notIn: Array.from(collectedIds),
          },
          OR: [{ promo: true }, { newArrival: true }, { rating: { gte: 4 } }],
        },
        select: recommendationProductSelect,
        orderBy: [{ rating: 'desc' }, { promo: 'desc' }, { newArrival: 'desc' }, { id: 'desc' }],
        take: 6 - primaryRecommendations.length,
      });
    }

    return {
      success: true,
      recommendations: [...primaryRecommendations, ...fallbackRecommendations].map(
        mapRecommendationProduct
      ),
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    logger.error('Errore recupero raccomandazioni utente', {
      requestId: event.context.requestId,
      userId: authUser.id,
      error,
    });

    throw createError({
      statusCode: 500,
      message: 'Errore durante il recupero delle raccomandazioni',
    });
  }
});
