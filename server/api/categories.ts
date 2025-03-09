import { PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';

const prisma = new PrismaClient();
const cache = new NodeCache({ stdTTL: 60 * 5 }); // Cache con TTL di 5 minuti

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    const cacheKey = 'categories'; // Chiave univoca per la cache

    // Controlla se i dati sono già in cache
    const cachedCategories = cache.get(cacheKey);
    if (cachedCategories) {
      console.log('Dati recuperati dalla cache');
      return cachedCategories;
    }

    // Se non ci sono dati in cache, esegui la query al database
    console.time('fetchCategories');
    const categories = await prisma.category.findMany({
      include: {
        images: true,
      },
    });
    console.timeEnd('fetchCategories');

    // Salva i dati in cache
    cache.set(cacheKey, categories);
    console.log('Dati salvati in cache');

    return categories;
  } else if (method === 'POST') {
    const body = await readBody(event);
    console.log(body);

    // Invalida la cache quando aggiungi una nuova categoria
    cache.del('categories');

    const newCategory = await prisma.category.create({
      data: body,
    });
    return newCategory;
  }
});