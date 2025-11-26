import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const action = query.action as string

  try {
    switch (action) {
      case 'sales':
        return await getSalesProducts()
      
      case 'new-arrivals':
        return await getNewArrivals()
      
      case 'recommendations':
        const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined
        const priceRange = query.priceRange as string
        return await getRecommendations(categoryId, priceRange)
      
      case 'low-stock':
        return await getLowStockProducts()
      
      case 'top-rated':
        return await getTopRatedProducts()
      
      case 'categories-stats':
        return await getCategoriesStats()
      
      case 'price-ranges':
        return await getPriceRanges()
      
      default:
        throw createError({
          statusCode: 400,
          message: 'Azione non valida'
        })
    }
  } catch (error) {
    console.error('Errore nel recupero dati e-commerce:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei dati'
    })
  }
})

// Prodotti in saldo con percentuali di sconto
async function getSalesProducts() {
  const salesProducts = await prisma.product.findMany({
    where: {
      promo: true,
      available_quantity: { gt: 0 }
    },
    include: {
      category: true,
      brand: true,
      gender: true
    },
    orderBy: {
      percentualPromo: 'desc'
    },
    take: 20
  })

  return {
    count: salesProducts.length,
    products: salesProducts.map(product => ({
      id: product.id,
      name: product.name,
      originalPrice: product.price,
      discountedPrice: product.price * (1 - product.percentualPromo / 100),
      discountPercentage: product.percentualPromo,
      category: product.category.name,
      brand: product.brand.name,
      gender: product.gender.name,
      stock: product.available_quantity,
      rating: product.rating
    }))
  }
}

// Nuovi arrivi
async function getNewArrivals() {
  const newProducts = await prisma.product.findMany({
    where: {
      newArrival: true,
      available_quantity: { gt: 0 }
    },
    include: {
      category: true,
      brand: true,
      gender: true
    },
    orderBy: {
      id: 'desc'
    },
    take: 15
  })

  return {
    count: newProducts.length,
    products: newProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category.name,
      brand: product.brand.name,
      isOnSale: product.promo,
      discountPercentage: product.promo ? product.percentualPromo : 0
    }))
  }
}

// Raccomandazioni intelligenti
async function getRecommendations(categoryId?: number, priceRange?: string) {
  let priceFilter = {}
  
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number)
    priceFilter = {
      price: {
        gte: min,
        lte: max || 9999
      }
    }
  }

  const recommendations = await prisma.product.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...priceFilter,
      available_quantity: { gt: 0 },
      OR: [
        { promo: true },
        { rating: { gte: 4.0 } },
        { newArrival: true }
      ]
    },
    include: {
      category: true,
      brand: true,
      gender: true
    },
    orderBy: [
      { promo: 'desc' },
      { rating: 'desc' },
      { newArrival: 'desc' }
    ],
    take: 12
  })

  return {
    count: recommendations.length,
    products: recommendations.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category.name,
      brand: product.brand.name,
      rating: product.rating,
      isOnSale: product.promo,
      isNewArrival: product.newArrival,
      discountPercentage: product.promo ? product.percentualPromo : 0,
      reason: getRecommendationReason(product)
    }))
  }
}

// Prodotti con scorte basse
async function getLowStockProducts() {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      available_quantity: { lte: 5, gt: 0 }
    },
    include: {
      category: true,
      brand: true
    },
    orderBy: {
      available_quantity: 'asc'
    },
    take: 10
  })

  return {
    count: lowStockProducts.length,
    products: lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.available_quantity,
      category: product.category.name,
      brand: product.brand.name
    }))
  }
}

// Prodotti più votati
async function getTopRatedProducts() {
  const topRated = await prisma.product.findMany({
    where: {
      rating: { gte: 4.0 },
      available_quantity: { gt: 0 }
    },
    include: {
      category: true,
      brand: true,
      gender: true
    },
    orderBy: {
      rating: 'desc'
    },
    take: 15
  })

  return {
    count: topRated.length,
    products: topRated.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      rating: product.rating,
      category: product.category.name,
      brand: product.brand.name,
      isOnSale: product.promo
    }))
  }
}

// Statistiche categorie
async function getCategoriesStats() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: {
          available_quantity: { gt: 0 }
        }
      }
    }
  })

  return categories.map(category => ({
    id: category.id,
    name: category.name,
    totalProducts: category.products.length,
    onSaleProducts: category.products.filter(p => p.promo).length,
    newArrivals: category.products.filter(p => p.newArrival).length,
    averagePrice: category.products.reduce((sum, p) => sum + p.price, 0) / category.products.length || 0
  }))
}

// Range di prezzi disponibili
async function getPriceRanges() {
  const priceStats = await prisma.product.aggregate({
    where: {
      available_quantity: { gt: 0 }
    },
    _min: { price: true },
    _max: { price: true },
    _avg: { price: true }
  })

  return {
    min: priceStats._min.price,
    max: priceStats._max.price,
    average: priceStats._avg.price,
    ranges: [
      { label: 'Economico', min: 0, max: 50 },
      { label: 'Medio', min: 50, max: 150 },
      { label: 'Premium', min: 150, max: 500 },
      { label: 'Lusso', min: 500, max: 9999 }
    ]
  }
}

// Logica per determinare il motivo della raccomandazione
function getRecommendationReason(product: any): string {
  if (product.promo && product.rating >= 4.0) {
    return 'In saldo e molto apprezzato'
  } else if (product.promo) {
    return 'Offerta speciale'
  } else if (product.rating >= 4.5) {
    return 'Altamente raccomandato'
  } else if (product.newArrival) {
    return 'Novità'
  }
  return 'Consigliato per te'
}