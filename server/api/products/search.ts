import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Extract filter parameters from query
  const filters: any = {};
  const whereConditions: any = {};
  
  // Text search
  if (query.q) {
    whereConditions.OR = [
      { name: { contains: query.q as string } },
      { description: { contains: query.q as string } }
    ];
  }
  
  // Category filter
  if (query.categories) {
    const categoryIds = Array.isArray(query.categories)
      ? query.categories.map((id: string) => parseInt(id, 10))
      : [parseInt(query.categories as string, 10)];
    
    whereConditions.categoryId = { in: categoryIds };
  }
  
  // Brand filter
  if (query.brands) {
    const brandIds = Array.isArray(query.brands)
      ? query.brands.map((id: string) => parseInt(id, 10))
      : [parseInt(query.brands as string, 10)];
    
    whereConditions.brandId = { in: brandIds };
  }
  
  // Gender filter
  if (query.gender) {
    whereConditions.genderId = parseInt(query.gender as string, 10);
  }
  
  // Price range filter
  if (query.priceMin || query.priceMax) {
    whereConditions.price = {};
    
    if (query.priceMin) {
      whereConditions.price.gte = parseFloat(query.priceMin as string);
    }
    
    if (query.priceMax) {
      whereConditions.price.lte = parseFloat(query.priceMax as string);
    }
  }
  
  // Availability filter
  if (query.inStock === 'true') {
    whereConditions.available_quantity = { gt: 0 };
  }
  
  // Promotion filter
  if (query.onSale === 'true') {
    whereConditions.promo = true;
  }
  
  // Favorites filter
  if (query.favorites === 'true') {
    whereConditions.favorite = true;
  }
  
  // New arrivals filter
  if (query.newArrivals === 'true') {
    whereConditions.newArrival = true;
  }
  
  // Sorting
  const orderBy: any = {};
  if (query.sortBy) {
    const sortField = query.sortBy as string;
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
    
    switch (sortField) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      default:
        // Default sort by newest
        orderBy.id = 'desc';
    }
  } else {
    // Default sort
    orderBy.id = 'desc';
  }
  
  // Pagination
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 12;
  const skip = (page - 1) * limit;
  
  try {
    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: whereConditions
    });
    
    // Get filtered products
    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        category: true,
        brand: true,
        gender: true,
      },
      orderBy,
      skip,
      take: limit
    });
    
    return {
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error searching products:', error);
    throw createError({
      statusCode: 500,
      message: 'Error searching products'
    });
  }
});