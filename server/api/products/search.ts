import type { Prisma } from '@prisma/client';
import { createLogger } from '../../utils/observability';
import { buildCacheKey, rememberCache } from '../../utils/cache';
import prisma from '../../utils/prisma';
const logger = createLogger('products-search');
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;
const MAX_SEARCH_LENGTH = 120;

type SortBy = 'id' | 'price' | 'name' | 'rating';
type SortOrder = 'asc' | 'desc';
type SearchQuery = Partial<Record<string, string | string[]>>;

type SearchParams = {
  q?: string;
  categories: number[];
  brands: number[];
  genderId?: number;
  subCategoryId?: number;
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  onSale: boolean;
  favorites: boolean;
  newArrivals: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
};

const productSearchSelect = {
  id: true,
  name: true,
  photo: true,
  codeItem: true,
  promo: true,
  plus: true,
  price: true,
  percentualPromo: true,
  rating: true,
  newArrival: true,
  available_quantity: true,
  categoryId: true,
  brandId: true,
  genderId: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  subCategory: {
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

function toFirstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

function toStringArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parsePositiveNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePositiveIntList(value: string | string[] | undefined): number[] {
  const parsed = toStringArray(value)
    .map((raw) => Number.parseInt(raw, 10))
    .filter((current) => Number.isInteger(current) && current > 0);

  return [...new Set(parsed)];
}

function normalizePage(value: string | undefined): number {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_PAGE;
  return parsed;
}

function normalizeLimit(value: string | undefined): number {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function parseSearchParams(query: SearchQuery): SearchParams {
  const rawQueryText = toFirstString(query.q)?.trim();
  const queryText = rawQueryText
    ? rawQueryText.slice(0, MAX_SEARCH_LENGTH)
    : undefined;

  const categories = parsePositiveIntList(query.categories as string | string[] | undefined);
  const brands = parsePositiveIntList(query.brands as string | string[] | undefined);
  const genderId = parsePositiveInt(toFirstString(query.gender as string | string[] | undefined));
  const subCategoryId = parsePositiveInt(
    toFirstString(query.subCategory as string | string[] | undefined)
  );

  const priceMin = parsePositiveNumber(toFirstString(query.priceMin as string | string[] | undefined));
  const priceMax = parsePositiveNumber(toFirstString(query.priceMax as string | string[] | undefined));

  const normalizedPriceMin =
    priceMin !== undefined && priceMax !== undefined && priceMin > priceMax ? priceMax : priceMin;
  const normalizedPriceMax =
    priceMin !== undefined && priceMax !== undefined && priceMin > priceMax ? priceMin : priceMax;

  const sortByRaw = toFirstString(query.sortBy as string | string[] | undefined);
  const sortOrderRaw = toFirstString(query.sortOrder as string | string[] | undefined);
  const sortBy: SortBy =
    sortByRaw === 'price' || sortByRaw === 'name' || sortByRaw === 'rating' || sortByRaw === 'id'
      ? sortByRaw
      : 'id';
  const sortOrder: SortOrder = sortOrderRaw === 'desc' ? 'desc' : 'asc';

  return {
    q: queryText,
    categories,
    brands,
    genderId,
    subCategoryId,
    priceMin: normalizedPriceMin,
    priceMax: normalizedPriceMax,
    inStock: toFirstString(query.inStock as string | string[] | undefined) === 'true',
    onSale: toFirstString(query.onSale as string | string[] | undefined) === 'true',
    favorites: toFirstString(query.favorites as string | string[] | undefined) === 'true',
    newArrivals: toFirstString(query.newArrivals as string | string[] | undefined) === 'true',
    sortBy,
    sortOrder: sortBy === 'id' && !sortOrderRaw ? 'desc' : sortOrder,
    page: normalizePage(toFirstString(query.page as string | string[] | undefined)),
    limit: normalizeLimit(toFirstString(query.limit as string | string[] | undefined)),
  };
}

function buildWhereConditions(params: SearchParams): Prisma.ProductWhereInput {
  const whereConditions: Prisma.ProductWhereInput = {};

  if (params.q) {
    whereConditions.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }

  if (params.categories.length > 0) {
    whereConditions.categoryId = { in: params.categories };
  }

  if (params.brands.length > 0) {
    whereConditions.brandId = { in: params.brands };
  }

  if (params.genderId) {
    whereConditions.genderId = params.genderId;
  }

  if (params.subCategoryId) {
    whereConditions.subCategoryId = params.subCategoryId;
  }

  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    whereConditions.price = {};
    if (params.priceMin !== undefined) {
      whereConditions.price.gte = params.priceMin;
    }
    if (params.priceMax !== undefined) {
      whereConditions.price.lte = params.priceMax;
    }
  }

  if (params.inStock) {
    whereConditions.available_quantity = { gt: 0 };
  }

  if (params.onSale) {
    whereConditions.promo = true;
  }

  if (params.favorites) {
    whereConditions.favorite = true;
  }

  if (params.newArrivals) {
    whereConditions.newArrival = true;
  }

  return whereConditions;
}

function buildOrderBy(params: SearchParams): Prisma.ProductOrderByWithRelationInput {
  if (params.sortBy === 'id') {
    return { id: params.sortOrder };
  }

  if (params.sortBy === 'name') {
    return { name: params.sortOrder };
  }

  if (params.sortBy === 'price') {
    return { price: params.sortOrder };
  }

  return { rating: params.sortOrder };
}

export default defineEventHandler(async (event) => {
  const params = parseSearchParams(getQuery(event) as SearchQuery);
  const whereConditions = buildWhereConditions(params);
  const priceBoundsWhere = buildWhereConditions({
    ...params,
    priceMin: undefined,
    priceMax: undefined,
  });
  const orderBy = buildOrderBy(params);
  const skip = (params.page - 1) * params.limit;
  const cacheKey = buildCacheKey('products:search', params);

  try {
    const { value: payload } = await rememberCache(cacheKey, 45, async () => {
      const [totalCount, products, priceAggregate] = await Promise.all([
        prisma.product.count({ where: whereConditions }),
        prisma.product.findMany({
          where: whereConditions,
          select: productSearchSelect,
          orderBy,
          skip,
          take: params.limit,
        }),
        prisma.product.aggregate({
          where: priceBoundsWhere,
          _min: {
            price: true,
          },
          _max: {
            price: true,
          },
        }),
      ]);

      const minPrice = Number(priceAggregate._min.price ?? 0);
      const maxPrice = Number(priceAggregate._max.price ?? 0);

      return {
        products,
        pagination: {
          total: totalCount,
          page: params.page,
          limit: params.limit,
          pages: Math.ceil(totalCount / params.limit),
        },
        facets: {
          priceRange: {
            min: Number.isFinite(minPrice) ? Number(minPrice.toFixed(2)) : 0,
            max: Number.isFinite(maxPrice) ? Number(maxPrice.toFixed(2)) : 0,
          },
        },
      };
    });

    return payload;
  } catch (error) {
    logger.error('Errore ricerca prodotti', {
      requestId: event.context.requestId,
      error,
      query: params.q,
      page: params.page,
      limit: params.limit,
    });
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei prodotti',
    });
  }
});
