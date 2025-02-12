import { PrismaClient } from '@prisma/client';
import { defineEventHandler, readBody } from 'h3';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = parseInt(event.context.params.id, 10);
  if (!id) {
    return { error: "product ID is required" };
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
    return product || { error: "product not found" };
  } else if (method === 'PUT') {
    // Aggiorna un product specifico tramite ID
    const body = await readBody(event);
    const updateProduct = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        categoryId: body.categoryId,
        brandId: body.brandId,
        genderId: body.genderId,
        favorite: body.favorite,
        promo: body.promo,
        plus: body.plus,
        newArrival: body.newArrival,
        price: body.price,
        photo: body.photo,
        codeItem: body.codeItem,
        percentualPromo: body.percentualPromo,
        rating: body.rating,
        description: body.description,
        available_quantity: body.available_quantity,
      },
    });
    return updateProduct;
  } else if (method === 'DELETE') {
    // Cancella un product specifico tramite ID
    const deletedProduct = await prisma.product.delete({
      where: { id: Number(id) },
    });
    return deletedProduct;
  } else {
    return { error: "Method not supported" };
  }
});
