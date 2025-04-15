// server/api/products/related.js

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const productId = parseInt(query.productId) || 0;
    const categoryId = parseInt(query.categoryId) || 0;
    const brandId = parseInt(query.brandId) || 0;
    const limit = parseInt(query.limit) || 4;
    
    // Validate parameters
    if (!productId || (!categoryId && !brandId)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters',
      });
    }
    
    // Get prisma client
    const prisma = event.context.prisma;
    
    // Build the query
    const whereClause = {
      AND: [
        { id: { not: productId } }, // Exclude current product
        {
          OR: []
        }
      ]
    };
    
    // Add category filter if provided
    if (categoryId) {
      whereClause.AND[1].OR.push({ categoryId });
    }
    
    // Add brand filter if provided
    if (brandId) {
      whereClause.AND[1].OR.push({ brandId });
    }
    
    // Query the database for related products
    const relatedProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        brand: true,
      },
      take: limit,
    });
    
    return relatedProducts;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Error fetching related products',
    });
  }
});