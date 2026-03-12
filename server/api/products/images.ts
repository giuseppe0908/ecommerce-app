import type { Prisma } from '@prisma/client';
import { defineEventHandler, readBody, createError, getQuery } from 'h3';
import { z } from 'zod';
import { requireAdminUser } from '../../utils/auth-session';
import { deleteCacheByPrefix } from '../../utils/cache';
import prisma from '../../utils/prisma';

const PRODUCTS_CACHE_PREFIX = 'products:';
type ProductImageWithColor = Prisma.ProductImageGetPayload<{
  include: { color: true }
}>;

// Schema per aggiungere un'immagine
const addImageSchema = z.object({
  productId: z.number().int().positive(),
  colorId: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().url("L'URL dell'immagine non è valido"),
  imageType: z.enum(['MAIN', 'SECONDARY', 'GENERAL']),
  sortOrder: z.number().int().min(0).optional().default(0)
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // GET - Recupera tutte le immagini di un prodotto
  if (method === 'GET') {
    const query = getQuery(event);
    const productId = parseInt(query.productId as string, 10);
    
    if (!productId) {
      throw createError({ statusCode: 400, message: "productId è richiesto" });
    }

    const images = await prisma.productImage.findMany({
      where: { productId },
      include: { color: true },
      orderBy: [
        { colorId: 'asc' },
        { imageType: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    // Organizza le immagini per colore
    const organizedImages = {
      general: images.filter((img: ProductImageWithColor) => img.imageType === 'GENERAL'),
      byColor: {} as Record<number, {
        colorId: number;
        colorName: string;
        colorHex: string | null;
        main: typeof images[0] | null;
        secondary: typeof images;
      }>
    };

    images.forEach((img: ProductImageWithColor) => {
      if (img.colorId && img.imageType !== 'GENERAL') {
        if (!organizedImages.byColor[img.colorId]) {
          organizedImages.byColor[img.colorId] = {
            colorId: img.colorId,
            colorName: img.color?.name || '',
            colorHex: img.color?.hex || null,
            main: null,
            secondary: []
          };
        }
        
        if (img.imageType === 'MAIN') {
          organizedImages.byColor[img.colorId].main = img;
        } else if (img.imageType === 'SECONDARY') {
          organizedImages.byColor[img.colorId].secondary.push(img);
        }
      }
    });

    return organizedImages;
  }

  // POST - Aggiunge una nuova immagine
  if (method === 'POST') {
    await requireAdminUser(event);

    const body = await readBody(event);
    const parsed = addImageSchema.safeParse(body);
    
    if (!parsed.success) {
      throw createError({ 
        statusCode: 400, 
        message: 'Dati non validi', 
        data: parsed.error.format() 
      });
    }

    // Se è un'immagine MAIN, verifica che non esista già per quel colore
    if (parsed.data.imageType === 'MAIN' && parsed.data.colorId) {
      const existingMain = await prisma.productImage.findFirst({
        where: {
          productId: parsed.data.productId,
          colorId: parsed.data.colorId,
          imageType: 'MAIN'
        }
      });

      if (existingMain) {
        // Aggiorna l'immagine esistente invece di crearne una nuova
        const updated = await prisma.productImage.update({
          where: { id: existingMain.id },
          data: { imageUrl: parsed.data.imageUrl }
        });
        await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
        return updated;
      }
    }

    const newImage = await prisma.productImage.create({
      data: {
        productId: parsed.data.productId,
        colorId: parsed.data.colorId || null,
        imageUrl: parsed.data.imageUrl,
        imageType: parsed.data.imageType,
        sortOrder: parsed.data.sortOrder
      },
      include: { color: true }
    });

    await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
    return newImage;
  }

  throw createError({ statusCode: 405, message: "Metodo non supportato" });
});
