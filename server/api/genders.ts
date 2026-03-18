import { z } from 'zod';
import { requireAdminUser } from '../utils/auth-session';
import { buildCacheKey, deleteCacheByPrefix, rememberCache } from '../utils/cache';
import { createLogger } from '../utils/observability';
import { shouldServePreviewEmptyCollectionFallback } from '../utils/preview-read-fallback';
import prisma from '../utils/prisma';

const GENDERS_CACHE_PREFIX = 'genders:';
const GENDERS_LIST_CACHE_KEY = buildCacheKey(`${GENDERS_CACHE_PREFIX}list`);
const PRODUCTS_CACHE_PREFIX = 'products:';
const logger = createLogger('genders');
const createGenderSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export default defineEventHandler(async (event) => {
    
    const method = event.node.req.method;
    if (method === 'GET') {
        try {
            const { value: genders } = await rememberCache(
                GENDERS_LIST_CACHE_KEY,
                60 * 5,
                () =>
                  prisma.gender.findMany({
                    orderBy: { name: 'asc' },
                  })
            )
            return genders
        } catch (error) {
            if (shouldServePreviewEmptyCollectionFallback()) {
                logger.warn('Fallback generi vuoti in preview senza DB remoto', {
                    requestId: event.context.requestId,
                    error,
                })
                return []
            }

            throw error
        }
    }
    else if(method === 'POST') {
        await requireAdminUser(event)

        const body = await readBody(event)
        const parsed = createGenderSchema.safeParse(body)
        if (!parsed.success) {
            throw createError({
                statusCode: 400,
                message: 'Payload genere non valido',
                data: parsed.error.format()
            })
        }

        const existingGender = await prisma.gender.findUnique({
            where: { name: parsed.data.name },
            select: { id: true }
        })
        if (existingGender) {
            throw createError({ statusCode: 409, message: 'Genere gia esistente' })
        }

        const newGender = await prisma.gender.create({
            data: {
                name: parsed.data.name
            },
        })
        await deleteCacheByPrefix(GENDERS_CACHE_PREFIX)
        await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX)
        setResponseStatus(event, 201)
        return newGender
        
    }

    throw createError({ statusCode: 405, message: 'Metodo non supportato' })
})    
