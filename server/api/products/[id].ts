import { PrismaClient } from '@prisma/client';
import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';

const prisma = new PrismaClient();

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
  subCategoryId: z.number().int().positive()
});


export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = parseInt(event.context.params.id, 10);
  if (!id) {
    throw createError({ statusCode: 400, message: "ID prodotto richiesto" });
  }

  if (method === 'GET') {
    // Recupera un singolo product tramite ID
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        brand: true,
      },
    });    
    if (!product) {
      throw createError({ statusCode: 404, message: "Prodotto non trovato" });
    }
    return product;
  } else if (method === 'PUT') {
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
    
    try {
      const updateProduct = await prisma.product.update({
        where: { id },
        data: parsed.data, // Use validated data
      });
      return updateProduct;
    } catch (error) {
      throw createError({ 
        statusCode: 500, 
        message: 'Errore durante l\'aggiornamento del prodotto',
        data: error
      });
    }
  } else if (method === 'DELETE') {
    // Cancella un product specifico tramite ID
    try {
      const deletedProduct = await prisma.product.delete({
        where: { id: Number(id) },
      });
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
