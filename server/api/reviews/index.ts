import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // GET method is not used here as we have a separate [productId].ts file for fetching reviews

  if (method === 'POST') {
    try {
      // Verify authentication
      const authHeader = event.node.req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({ statusCode: 401, message: 'Authentication required' });
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        throw createError({ statusCode: 401, message: 'Invalid token' });
      }

      const userId = decoded.id;

      // Get request body
      const { productId, rating, comment } = await readBody(event);

      // Validate input
      if (!productId || !rating || rating < 1 || rating > 5) {
        throw createError({ 
          statusCode: 400, 
          message: 'Invalid input. ProductId and rating (1-5) are required.' 
        });
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw createError({ statusCode: 404, message: 'Product not found' });
      }

      // Check if user has already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          productId,
          userId
        }
      });

      let review;
      if (existingReview) {
        // Update existing review
        review = await prisma.review.update({
          where: { id: existingReview.id },
          data: {
            rating,
            comment
          }
        });
      } else {
        // Create new review
        review = await prisma.review.create({
          data: {
            productId,
            userId,
            rating,
            comment
          }
        });
      }

      // Update product average rating
      const allReviews = await prisma.review.findMany({
        where: { productId }
      });
      
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      await prisma.product.update({
        where: { id: productId },
        data: { rating: averageRating }
      });

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});