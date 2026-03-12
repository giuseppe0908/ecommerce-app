import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';
import { requireAdminUser } from '../../utils/auth-session';
import { deleteCacheByPrefix } from '../../utils/cache';
import prisma from '../../utils/prisma';

const PRODUCTS_CACHE_PREFIX = 'products:';

// Define schema for product validation
const productSchema = z.object({
  name: z.string().min(3, "Il nome deve contenere almeno 3 caratteri"),
  price: z.number().positive("Il prezzo deve essere un valore positivo"),
  categoryId: z.number().int().positive(),
  brandId: z.number().int().positive(),
  genderId: z.number().int().positive(),
  favorite: z.boolean().optional().default(false),
  promo: z.boolean().optional().default(false),
  plus: z.boolean().optional().default(false),
  newArrival: z.boolean().optional().default(false),
  photo: z.string().url("L'URL della foto non è valido").optional(),
  codeItem: z.string().optional(),
  percentualPromo: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  description: z.string().optional(),
  available_quantity: z.number().int().min(0).optional(),
  subCategoryId: z.number().int().positive().nullable().optional()
});

async function assertSubCategoryBelongsToCategory(
  categoryId: number,
  subCategoryId: number | null | undefined
) {
  if (!subCategoryId) return;

  const subCategory = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
    select: { id: true, categoryId: true },
  });

  if (!subCategory) {
    throw createError({ statusCode: 400, message: 'Sottocategoria non valida' });
  }

  if (subCategory.categoryId !== categoryId) {
    throw createError({
      statusCode: 400,
      message: 'La sottocategoria non appartiene alla categoria selezionata',
    });
  }
}


export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = parseInt(event.context.params?.id || '', 10);
  if (!id) {
    throw createError({ statusCode: 400, message: "ID prodotto richiesto" });
  }

  if (method === 'GET') {
    // Recupera un singolo product tramite ID
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        subCategory: true,
        brand: true,
        gender: true,
        features: {
          include: {
            feature: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
          orderBy: {
            featureId: 'asc',
          },
        },
        productColors: {
          include: { color: true }
        },
        images: {
          include: { color: true },
          orderBy: [
            { colorId: 'asc' },
            { imageType: 'asc' },
            { sortOrder: 'asc' }
          ]
        }
      },
    });
    if (!product) {
      throw createError({ statusCode: 404, message: "Prodotto non trovato" });
    }
    return product;
  } else if (method === 'PUT') {
    await requireAdminUser(event);

    // Aggiorna un product specifico tramite ID
    const body = await readBody(event);
    // Validate input data with Zod
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        message: 'Dati non validi',
        data: parsed.error.format()
      });
    }

    await assertSubCategoryBelongsToCategory(
      parsed.data.categoryId,
      parsed.data.subCategoryId
    );

    try {
      const updateProduct = await prisma.product.update({
        where: { id },
        data: parsed.data, // Use validated data
      });
      await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
      return updateProduct;
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: 'Errore durante l\'aggiornamento del prodotto',
        data: error
      });
    }
  } else if (method === 'DELETE') {
    await requireAdminUser(event);

    // Cancella un product specifico tramite ID
    try {
      const deletedProduct = await prisma.product.delete({
        where: { id: Number(id) },
      });
      await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
      return deletedProduct;
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: 'Errore durante l\'eliminazione del prodotto',
        data: error
      });
    }
  } else {
    throw createError({ statusCode: 405, message: "Metodo non supportato" });
  }
});
