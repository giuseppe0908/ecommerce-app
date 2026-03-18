import { Prisma } from '@prisma/client';
import { defineEventHandler, readBody, createError, setResponseStatus } from 'h3';
import { z } from 'zod';
import { requireAuthenticatedUser } from '../utils/auth-session';
import { createLogger } from '../utils/observability';
import prisma from '../utils/prisma';

const logger = createLogger('favorites');
const positiveIntSchema = z.coerce.number().int().positive();

const createFavoriteSchema = z
  .object({
    productId: positiveIntSchema,
  })
  .strict();

const deleteFavoriteSchema = z
  .object({
    productId: positiveIntSchema.optional(),
    clearAll: z.preprocess((value) => {
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') return true;
        if (normalized === 'false' || normalized === '0' || normalized === '') return false;
      }
      return value;
    }, z.boolean().optional().default(false)),
  })
  .strict()
  .refine((value) => value.clearAll || Boolean(value.productId), {
    message: 'ID prodotto richiesto quando clearAll e false',
    path: ['productId'],
  });

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  if (method !== 'GET' && method !== 'POST' && method !== 'DELETE') {
    throw createError({ statusCode: 405, message: 'Metodo non supportato' });
  }

  const authUser = await requireAuthenticatedUser(event);

  if (method === 'GET') {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: authUser.id },
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              gender: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return favorites;
    } catch (error) {
      logger.error('Errore nel recupero dei preferiti', {
        requestId: event.context.requestId,
        userId: authUser.id,
        error,
      });
      throw createError({ statusCode: 500, message: 'Errore nel recupero dei preferiti' });
    }
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const parsedBody = createFavoriteSchema.safeParse(body);

    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        message: 'Payload preferiti non valido',
        data: parsedBody.error.format(),
      });
    }

    const productId = parsedBody.data.productId;

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!product) {
        throw createError({ statusCode: 404, message: 'Prodotto non trovato' });
      }

      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId: authUser.id,
            productId,
          },
        },
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              gender: true,
            },
          },
        },
      });

      if (existingFavorite) {
        return { message: 'Prodotto già nei preferiti', favorite: existingFavorite };
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId: authUser.id,
          productId,
        },
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              gender: true,
            },
          },
        },
      });

      setResponseStatus(event, 201);
      return { message: 'Prodotto aggiunto ai preferiti', favorite };
    } catch (error) {
      if ((error as { statusCode?: number })?.statusCode) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_productId: {
              userId: authUser.id,
              productId,
            },
          },
          include: {
            product: {
              include: {
                brand: true,
                category: true,
                gender: true,
              },
            },
          },
        });

        if (favorite) {
          return { message: 'Prodotto già nei preferiti', favorite };
        }
      }

      logger.error('Errore nell\'aggiunta ai preferiti', {
        requestId: event.context.requestId,
        userId: authUser.id,
        productId,
        error,
      });
      throw createError({ statusCode: 500, message: 'Errore nell\'aggiunta ai preferiti' });
    }
  }

  const body = await readBody(event);
  const parsedBody = deleteFavoriteSchema.safeParse(body);
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: 'Payload eliminazione preferiti non valido',
      data: parsedBody.error.format(),
    });
  }

  const { productId, clearAll } = parsedBody.data;

  try {
    if (clearAll) {
      const deleted = await prisma.favorite.deleteMany({
        where: { userId: authUser.id },
      });
      return {
        message: 'Tutti i preferiti rimossi con successo',
        deletedCount: deleted.count,
      };
    }

    const deleted = await prisma.favorite.deleteMany({
      where: {
        userId: authUser.id,
        productId,
      },
    });

    return {
      message: 'Prodotto rimosso dai preferiti',
      deletedCount: deleted.count,
    };
  } catch (error) {
    logger.error('Errore nella rimozione dai preferiti', {
      requestId: event.context.requestId,
      userId: authUser.id,
      productId,
      clearAll,
      error,
    });
    throw createError({ statusCode: 500, message: 'Errore nella rimozione dai preferiti' });
  }
});
