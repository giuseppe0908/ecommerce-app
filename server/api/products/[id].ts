import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const { id } = event.context.params;

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
    console.log("hhh");
    
    return product || { error: "product not found" };
  } else if (method === 'PUT') {
    // Aggiorna un product specifico tramite ID
    const body = await readBody(event);
    const updateProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: body,
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
