// Business Logic per Raccomandazioni E-commerce Intelligenti
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface UserProfile {
  favoriteCategories: string[]
  priceRange: { min: number; max: number }
  preferredBrands: string[]
  size?: string
  gender?: string
  purchaseHistory?: any[]
  browsingHistory?: any[]
}

export interface RecommendationContext {
  currentPage?: string
  productId?: string
  categoryId?: string
  searchQuery?: string
  saleInterest?: boolean
  priceInterest?: boolean
  categoryInterest?: string
  recentKeywords?: string[]
  userIntent?: string
}

export interface SmartRecommendation {
  products: any[]
  reasoning: string
  confidence: number
  strategy: string
  alternatives?: any[]
}

// Motore di raccomandazioni intelligenti
export class EcommerceRecommendationEngine {
  
  // Raccomandazioni basate su contesto e profilo utente
  static async getSmartRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    limit: number = 8
  ): Promise<SmartRecommendation> {
    
    let strategy = 'general'
    let reasoning = ''
    let confidence = 0.5
    let products: any[] = []
    
    try {
      // 1. STRATEGIA SALDI - Priorità massima se utente interessato
      if (context.saleInterest || context.userIntent === 'sale_inquiry') {
        const saleProducts = await this.getSaleProducts(userProfile, limit)
        if (saleProducts.length > 0) {
          products = saleProducts
          strategy = 'sale_focused'
          reasoning = 'Ho trovato prodotti in saldo che potrebbero interessarti basandomi sulle tue preferenze'
          confidence = 0.9
        }
      }
      
      // 2. STRATEGIA CATEGORIA SPECIFICA
      else if (context.categoryInterest) {
        const categoryProducts = await this.getCategoryProducts(
          context.categoryInterest, 
          userProfile, 
          limit
        )
        if (categoryProducts.length > 0) {
          products = categoryProducts
          strategy = 'category_focused'
          reasoning = `Ho selezionato prodotti di ${context.categoryInterest} in base alle tue preferenze`
          confidence = 0.8
        }
      }
      
      // 3. STRATEGIA PREZZO SENSIBILE
      else if (context.priceInterest || context.userIntent === 'price_inquiry') {
        const budgetProducts = await this.getBudgetFriendlyProducts(userProfile, limit)
        if (budgetProducts.length > 0) {
          products = budgetProducts
          strategy = 'budget_focused'
          reasoning = 'Ho trovato prodotti con un ottimo rapporto qualità-prezzo per te'
          confidence = 0.7
        }
      }
      
      // 4. STRATEGIA NUOVI ARRIVI
      else if (context.userIntent === 'new_arrivals') {
        const newProducts = await this.getNewArrivals(userProfile, limit)
        if (newProducts.length > 0) {
          products = newProducts
          strategy = 'new_arrivals'
          reasoning = 'Ecco i nuovi arrivi che potrebbero piacerti'
          confidence = 0.6
        }
      }
      
      // 5. STRATEGIA PERSONALIZZATA (default)
      else {
        const personalizedProducts = await this.getPersonalizedRecommendations(
          userProfile, 
          context, 
          limit
        )
        products = personalizedProducts
        strategy = 'personalized'
        reasoning = 'Ho selezionato questi prodotti basandomi sul tuo profilo e preferenze'
        confidence = 0.7
      }
      
      // Aggiungi alternative se pochi risultati
      let alternatives: any[] = []
      if (products.length < 4) {
        alternatives = await this.getAlternativeRecommendations(
          userProfile, 
          context, 
          8 - products.length
        )
      }
      
      return {
        products,
        reasoning,
        confidence,
        strategy,
        alternatives
      }
      
    } catch (error) {
      console.error('Errore nel motore di raccomandazioni:', error)
      
      // Fallback con prodotti generici
      const fallbackProducts = await this.getFallbackProducts(limit)
      return {
        products: fallbackProducts,
        reasoning: 'Ho selezionato alcuni prodotti popolari per te',
        confidence: 0.3,
        strategy: 'fallback'
      }
    }
  }
  
  // Prodotti in saldo personalizzati
  private static async getSaleProducts(userProfile: UserProfile, limit: number) {
    const whereClause: any = {
      promo: true,
      percentualPromo: { gt: 0 }
    }
    
    // Filtra per categorie preferite se disponibili
    if (userProfile.favoriteCategories.length > 0) {
      whereClause.subCategory = {
        category: {
          name: { in: userProfile.favoriteCategories }
        }
      }
    }
    
    // Filtra per range di prezzo
    if (userProfile.priceRange) {
      whereClause.price = {
        gte: userProfile.priceRange.min,
        lte: userProfile.priceRange.max
      }
    }
    
    // Filtra per brand preferiti
    if (userProfile.preferredBrands.length > 0) {
      whereClause.brand = {
        name: { in: userProfile.preferredBrands }
      }
    }
    
    return await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true,
        subCategory: { include: { category: true } },
        productColors: { include: { color: true } },
        reviews: true
      },
      orderBy: [
        { percentualPromo: 'desc' },
        { rating: 'desc' }
      ],
      take: limit
    })
  }
  
  // Prodotti per categoria specifica
  private static async getCategoryProducts(
    categoryName: string, 
    userProfile: UserProfile, 
    limit: number
  ) {
    const whereClause: any = {
      subCategory: {
        category: {
          name: { contains: categoryName, mode: 'insensitive' }
        }
      }
    }
    
    // Applica filtri del profilo utente
    if (userProfile.priceRange) {
      whereClause.price = {
        gte: userProfile.priceRange.min,
        lte: userProfile.priceRange.max
      }
    }
    
    if (userProfile.preferredBrands.length > 0) {
      whereClause.brand = {
        name: { in: userProfile.preferredBrands }
      }
    }
    
    return await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true,
        subCategory: { include: { category: true } },
        productColors: { include: { color: true } },
        reviews: true
      },
      orderBy: [
        { promo: 'desc' },
        { rating: 'desc' },
        { newArrival: 'desc' }
      ],
      take: limit
    })
  }
  
  // Prodotti budget-friendly
  private static async getBudgetFriendlyProducts(userProfile: UserProfile, limit: number) {
    const maxPrice = userProfile.priceRange?.max || 100
    
    return await prisma.product.findMany({
      where: {
        price: { lte: maxPrice },
        OR: [
          { promo: true },
          { rating: { gte: 4 } }
        ]
      },
      include: {
        brand: true,
        subCategory: { include: { category: true } },
        productColors: { include: { color: true } },
        reviews: true
      },
      orderBy: [
        { price: 'asc' },
        { rating: 'desc' }
      ],
      take: limit
    })
  }
  
  // Nuovi arrivi personalizzati
  private static async getNewArrivals(userProfile: UserProfile, limit: number) {
    const whereClause: any = {
      newArrival: true
    }
    
    // Applica filtri del profilo
    if (userProfile.favoriteCategories.length > 0) {
      whereClause.subCategory = {
        category: {
          name: { in: userProfile.favoriteCategories }
        }
      }
    }
    
    if (userProfile.priceRange) {
      whereClause.price = {
        gte: userProfile.priceRange.min,
        lte: userProfile.priceRange.max
      }
    }
    
    return await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true,
        subCategory: { include: { category: true } },
        productColors: { include: { color: true } },
        reviews: true
      },
      orderBy: { rating: 'desc' },
      take: limit
    })
  }
  
  // Raccomandazioni personalizzate avanzate
  private static async getPersonalizedRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    limit: number
  ) {
    // Algoritmo di scoring personalizzato
    const products = await prisma.product.findMany({
      where: {
        price: userProfile.priceRange ? {
          gte: userProfile.priceRange.min,
          lte: userProfile.priceRange.max
        } : undefined
      },
      include: {
        brand: true,
        subCategory: { include: { category: true } },
        productColors: { include: { color: true } },
        reviews: true
      },
      take: limit * 3 // Prendiamo più prodotti per poi scorarli
    })
    
    // Scoring intelligente
    const scoredProducts = products.map(product => {
      let score = 0
      
      // Bonus per categorie preferite
      if (product.subCategory && userProfile.favoriteCategories.includes(product.subCategory.category.name)) {
        score += 30
      }
      
      // Bonus per brand preferiti
      if (userProfile.preferredBrands.includes(product.brand.name)) {
        score += 25
      }
      
      // Bonus per prodotti in saldo
      if (product.promo) {
        score += 20
      }
      
      // Bonus per rating alto
      if (product.rating) {
        score += product.rating * 5
      }
      
      // Bonus per popolarità (numero recensioni)
      score += Math.min(product.reviews.length, 10)
      
      // Bonus per nuovi arrivi
      if (product.newArrival) {
        score += 15
      }
      
      return { ...product, score }
    })
    
    // Ordina per score e prendi i migliori
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }
  
  // Raccomandazioni alternative
  private static async getAlternativeRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    limit: number
  ) {
    return await prisma.product.findMany({
      where: {
        OR: [
          { promo: true },
          { rating: { gte: 4 } },
          { newArrival: true }
        ]
      },
      include: {
        brand: true,
        subCategory: { include: { category: true } },
        productColors: { include: { color: true } },
        reviews: true
      },
      orderBy: { rating: 'desc' },
      take: limit
    })
  }
  
  // Prodotti fallback
  private static async getFallbackProducts(limit: number) {
    return await prisma.product.findMany({
      include: {
        brand: true,
        subCategory: { include: { category: true } },
        productColors: { include: { color: true } },
        reviews: true
      },
      orderBy: { rating: 'desc' },
      take: limit
    })
  }
}