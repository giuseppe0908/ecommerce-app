import type { Prisma } from '@prisma/client';
import { createLogger } from '../../utils/observability';
import prisma from '../../utils/prisma';

const logger = createLogger('chat-recommendations');
const DEFAULT_RECOMMENDATION_LIMIT = 8;
const MAX_RECOMMENDATION_LIMIT = 24;

export interface UserProfile {
  favoriteCategories: string[];
  priceRange: { min: number; max: number };
  preferredBrands: string[];
  size?: string;
  gender?: string;
  purchaseHistory?: any[];
  browsingHistory?: any[];
}

export interface RecommendationContext {
  currentPage?: string;
  productId?: string;
  categoryId?: string;
  searchQuery?: string;
  saleInterest?: boolean;
  priceInterest?: boolean;
  categoryInterest?: string;
  recentKeywords?: string[];
  userIntent?: string;
}

export interface SmartRecommendation {
  products: any[];
  reasoning: string;
  confidence: number;
  strategy: string;
  alternatives?: any[];
}

const recommendationProductSelect = {
  id: true,
  name: true,
  price: true,
  photo: true,
  codeItem: true,
  promo: true,
  percentualPromo: true,
  rating: true,
  newArrival: true,
  plus: true,
  description: true,
  available_quantity: true,
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
  subCategory: {
    select: {
      id: true,
      name: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

const recommendationProductWithCountSelect = {
  ...recommendationProductSelect,
  _count: {
    select: {
      reviews: true,
    },
  },
} satisfies Prisma.ProductSelect;

type RecommendationProduct = Prisma.ProductGetPayload<{ select: typeof recommendationProductSelect }>;
type RecommendationProductWithCount = Prisma.ProductGetPayload<{
  select: typeof recommendationProductWithCountSelect;
}>;
type ScoredRecommendationProduct = RecommendationProductWithCount & { score: number };

type StrategyResult = {
  products: RecommendationProduct[];
  strategy: string;
  reasoning: string;
  confidence: number;
};

function normalizeLimit(limit: number | undefined): number {
  if (!Number.isFinite(limit)) return DEFAULT_RECOMMENDATION_LIMIT;
  const parsed = Number(limit);
  if (parsed <= 0) return DEFAULT_RECOMMENDATION_LIMIT;
  return Math.min(Math.floor(parsed), MAX_RECOMMENDATION_LIMIT);
}

function toSafeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);
}

function toSafePriceRange(priceRange: UserProfile['priceRange'] | undefined) {
  if (!priceRange) return undefined;
  const min = Number(priceRange.min);
  const max = Number(priceRange.max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  if (min < 0 || max < 0) return undefined;
  const normalizedMin = Math.min(min, max);
  const normalizedMax = Math.max(min, max);
  return { min: normalizedMin, max: normalizedMax };
}

function buildBaseProfileWhere(userProfile: UserProfile): Prisma.ProductWhereInput {
  const whereClause: Prisma.ProductWhereInput = {
    available_quantity: { gt: 0 },
  };

  const safeCategories = toSafeStringArray(userProfile.favoriteCategories);
  if (safeCategories.length > 0) {
    whereClause.subCategory = {
      category: {
        name: { in: safeCategories },
      },
    };
  }

  const safeBrands = toSafeStringArray(userProfile.preferredBrands);
  if (safeBrands.length > 0) {
    whereClause.brand = {
      name: { in: safeBrands },
    };
  }

  const safePriceRange = toSafePriceRange(userProfile.priceRange);
  if (safePriceRange) {
    whereClause.price = {
      gte: safePriceRange.min,
      lte: safePriceRange.max,
    };
  }

  return whereClause;
}

function stripReviewCount(products: RecommendationProductWithCount[]): RecommendationProduct[] {
  return products.map((product) => {
    const { _count: _discard, ...rest } = product;
    return rest;
  });
}

export class EcommerceRecommendationEngine {
  static async getSmartRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    limit = DEFAULT_RECOMMENDATION_LIMIT
  ): Promise<SmartRecommendation> {
    const normalizedLimit = normalizeLimit(limit);

    try {
      let result: StrategyResult;

      if (context.saleInterest || context.userIntent === 'sale_inquiry') {
        const products = await this.getSaleProducts(userProfile, normalizedLimit);
        if (products.length > 0) {
          result = {
            products,
            strategy: 'sale_focused',
            reasoning: 'Ho trovato prodotti in saldo che potrebbero interessarti basandomi sulle tue preferenze',
            confidence: 0.9,
          };
        } else {
          result = await this.getPersonalizedStrategy(userProfile, context, normalizedLimit);
        }
      } else if (context.categoryInterest) {
        const products = await this.getCategoryProducts(context.categoryInterest, userProfile, normalizedLimit);
        if (products.length > 0) {
          result = {
            products,
            strategy: 'category_focused',
            reasoning: `Ho selezionato prodotti di ${context.categoryInterest} in base alle tue preferenze`,
            confidence: 0.8,
          };
        } else {
          result = await this.getPersonalizedStrategy(userProfile, context, normalizedLimit);
        }
      } else if (context.priceInterest || context.userIntent === 'price_inquiry') {
        const products = await this.getBudgetFriendlyProducts(userProfile, normalizedLimit);
        if (products.length > 0) {
          result = {
            products,
            strategy: 'budget_focused',
            reasoning: 'Ho trovato prodotti con un ottimo rapporto qualita-prezzo per te',
            confidence: 0.7,
          };
        } else {
          result = await this.getPersonalizedStrategy(userProfile, context, normalizedLimit);
        }
      } else if (context.userIntent === 'new_arrivals') {
        const products = await this.getNewArrivals(userProfile, normalizedLimit);
        if (products.length > 0) {
          result = {
            products,
            strategy: 'new_arrivals',
            reasoning: 'Ecco i nuovi arrivi che potrebbero piacerti',
            confidence: 0.6,
          };
        } else {
          result = await this.getPersonalizedStrategy(userProfile, context, normalizedLimit);
        }
      } else {
        result = await this.getPersonalizedStrategy(userProfile, context, normalizedLimit);
      }

      let alternatives: RecommendationProduct[] = [];
      if (result.products.length < 4) {
        const fallbackLimit = Math.max(0, normalizedLimit - result.products.length);
        if (fallbackLimit > 0) {
          alternatives = await this.getAlternativeRecommendations(userProfile, context, fallbackLimit);
        }
      }

      return {
        products: result.products,
        reasoning: result.reasoning,
        confidence: result.confidence,
        strategy: result.strategy,
        alternatives,
      };
    } catch (error) {
      logger.error('Errore nel motore di raccomandazioni', { error });
      const fallbackProducts = await this.getFallbackProducts(normalizedLimit);
      return {
        products: fallbackProducts,
        reasoning: 'Ho selezionato alcuni prodotti popolari per te',
        confidence: 0.3,
        strategy: 'fallback',
      };
    }
  }

  private static async getPersonalizedStrategy(
    userProfile: UserProfile,
    context: RecommendationContext,
    limit: number
  ): Promise<StrategyResult> {
    const products = await this.getPersonalizedRecommendations(userProfile, context, limit);
    return {
      products,
      strategy: 'personalized',
      reasoning: 'Ho selezionato questi prodotti basandomi sul tuo profilo e preferenze',
      confidence: 0.7,
    };
  }

  private static async getSaleProducts(userProfile: UserProfile, limit: number) {
    const whereClause: Prisma.ProductWhereInput = {
      ...buildBaseProfileWhere(userProfile),
      promo: true,
      percentualPromo: { gt: 0 },
    };

    return prisma.product.findMany({
      where: whereClause,
      select: recommendationProductSelect,
      orderBy: [{ percentualPromo: 'desc' }, { rating: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  private static async getCategoryProducts(
    categoryName: string,
    userProfile: UserProfile,
    limit: number
  ) {
    const trimmedCategory = String(categoryName || '').trim();
    const whereClause: Prisma.ProductWhereInput = {
      ...buildBaseProfileWhere(userProfile),
      subCategory: {
        category: {
          name: { contains: trimmedCategory, mode: 'insensitive' },
        },
      },
    };

    return prisma.product.findMany({
      where: whereClause,
      select: recommendationProductSelect,
      orderBy: [{ promo: 'desc' }, { rating: 'desc' }, { newArrival: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  private static async getBudgetFriendlyProducts(userProfile: UserProfile, limit: number) {
    const maxPrice = toSafePriceRange(userProfile.priceRange)?.max ?? 100;

    return prisma.product.findMany({
      where: {
        available_quantity: { gt: 0 },
        price: { lte: maxPrice },
        OR: [{ promo: true }, { rating: { gte: 4 } }],
      },
      select: recommendationProductSelect,
      orderBy: [{ price: 'asc' }, { rating: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  private static async getNewArrivals(userProfile: UserProfile, limit: number) {
    const whereClause: Prisma.ProductWhereInput = {
      ...buildBaseProfileWhere(userProfile),
      newArrival: true,
    };

    return prisma.product.findMany({
      where: whereClause,
      select: recommendationProductSelect,
      orderBy: [{ rating: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  private static async getPersonalizedRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    limit: number
  ) {
    const candidatePoolSize = Math.min(limit * 3, MAX_RECOMMENDATION_LIMIT * 2);
    const products = await prisma.product.findMany({
      where: buildBaseProfileWhere(userProfile),
      select: recommendationProductWithCountSelect,
      orderBy: [{ promo: 'desc' }, { rating: 'desc' }, { id: 'desc' }],
      take: candidatePoolSize,
    });

    const safeFavoriteCategories = toSafeStringArray(userProfile.favoriteCategories);
    const safePreferredBrands = toSafeStringArray(userProfile.preferredBrands);
    const contextKeywords = toSafeStringArray(context.recentKeywords).map((keyword) => keyword.toLowerCase());

    const scoredProducts = products.map((product: RecommendationProductWithCount) => {
      let score = 0;
      const categoryName = product.subCategory?.category?.name || '';
      const brandName = product.brand?.name || '';
      const productName = product.name.toLowerCase();
      const description = (product.description || '').toLowerCase();

      if (categoryName && safeFavoriteCategories.includes(categoryName)) score += 30;
      if (brandName && safePreferredBrands.includes(brandName)) score += 25;
      if (product.promo) score += 20;
      if (product.rating) score += product.rating * 5;
      score += Math.min(product._count.reviews, 10);
      if (product.newArrival) score += 15;
      if (contextKeywords.some((keyword) => productName.includes(keyword) || description.includes(keyword))) {
        score += 10;
      }

      return { ...product, score };
    });

    const topProducts = scoredProducts
      .sort((a: ScoredRecommendationProduct, b: ScoredRecommendationProduct) => b.score - a.score)
      .slice(0, limit);

    return stripReviewCount(topProducts);
  }

  private static async getAlternativeRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    limit: number
  ) {
    void userProfile;
    void context;

    return prisma.product.findMany({
      where: {
        available_quantity: { gt: 0 },
        OR: [{ promo: true }, { rating: { gte: 4 } }, { newArrival: true }],
      },
      select: recommendationProductSelect,
      orderBy: [{ rating: 'desc' }, { promo: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  private static async getFallbackProducts(limit: number) {
    return prisma.product.findMany({
      where: {
        available_quantity: { gt: 0 },
      },
      select: recommendationProductSelect,
      orderBy: [{ rating: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }
}
