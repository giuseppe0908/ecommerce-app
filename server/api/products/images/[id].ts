import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';
import { requireAdminUser } from '../../../utils/auth-session';
import { deleteCacheByPrefix } from '../../../utils/cache';
import prisma from '../../../utils/prisma';

const PRODUCTS_CACHE_PREFIX = 'products:';

// Schema per aggiornare un'immagine
const updateImageSchema = z.object({
    imageUrl: z.string().url("L'URL dell'immagine non è valido").optional(),
    imageType: z.enum(['MAIN', 'SECONDARY', 'GENERAL']).optional(),
    sortOrder: z.number().int().min(0).optional()
});

export default defineEventHandler(async (event) => {
    const method = event.node.req.method;
    const id = parseInt(event.context.params?.id as string, 10);

    if (!id) {
        throw createError({ statusCode: 400, message: "ID immagine richiesto" });
    }

    // GET - Recupera una singola immagine
    if (method === 'GET') {
        const image = await prisma.productImage.findUnique({
            where: { id },
            include: { color: true, product: true }
        });

        if (!image) {
            throw createError({ statusCode: 404, message: "Immagine non trovata" });
        }

        return image;
    }

    // PUT - Aggiorna un'immagine
    if (method === 'PUT') {
        await requireAdminUser(event);

        const body = await readBody(event);
        const parsed = updateImageSchema.safeParse(body);

        if (!parsed.success) {
            throw createError({
                statusCode: 400,
                message: 'Dati non validi',
                data: parsed.error.format()
            });
        }

        try {
            const updatedImage = await prisma.productImage.update({
                where: { id },
                data: parsed.data,
                include: { color: true }
            });
            await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
            return updatedImage;
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: "Errore durante l'aggiornamento dell'immagine",
                data: error
            });
        }
    }

    // DELETE - Elimina un'immagine
    if (method === 'DELETE') {
        await requireAdminUser(event);

        try {
            const deletedImage = await prisma.productImage.delete({
                where: { id }
            });
            await deleteCacheByPrefix(PRODUCTS_CACHE_PREFIX);
            return { success: true, deleted: deletedImage };
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: "Errore durante l'eliminazione dell'immagine",
                data: error
            });
        }
    }

    throw createError({ statusCode: 405, message: "Metodo non supportato" });
});
