import { z } from 'zod';
import { requireAuthenticatedUser } from '../../utils/auth-session';
import { createLogger } from '../../utils/observability';
import prisma from '../../utils/prisma';

const logger = createLogger('reviews');
const reviewBodySchema = z.object({
  productId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value || ''),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // GET method is not used here as we have a separate [productId].ts file for fetching reviews

  if (method === 'POST') {
    try {
      const authUser = await requireAuthenticatedUser(event);
      const userId = authUser.id;

      // Get request body
      const body = await readBody(event);
      const parsedBody = reviewBodySchema.safeParse(body);
      if (!parsedBody.success) {
        throw createError({
          statusCode: 400,
          message: 'Input recensione non valido',
          data: parsedBody.error.format(),
        });
      }
      const { productId, rating, comment } = parsedBody.data;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw createError({ statusCode: 404, message: 'Product not found' });
      }

      const review = await prisma.review.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        create: {
          productId,
          userId,
          rating,
          comment,
        },
        update: {
          rating,
          comment,
        },
      });

      // Update product average rating usando aggregate (evita full scan applicativo).
      const ratingAggregate = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      });

      const averageRating = Number(ratingAggregate._avg.rating ?? 0);

      await prisma.product.update({
        where: { id: productId },
        data: { rating: averageRating },
      });

      return review;
    } catch (error) {
      if ((error as { statusCode?: number })?.statusCode) {
        throw error;
      }

      logger.error('Errore creazione recensione', {
        requestId: event.context.requestId,
        error,
      });
      throw createError({
        statusCode: 500,
        message: 'Errore durante il salvataggio della recensione',
      });
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});
