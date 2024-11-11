import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const { id } = event.context.params;

  if (!id) {
    return { error: "Item ID is required" };
  }

  if (method === 'GET') {
    // Recupera un singolo item tramite ID
    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        brand: true,
      },
    });
    return item || { error: "Item not found" };
  } else if (method === 'PUT') {
    // Aggiorna un item specifico tramite ID
    const body = await readBody(event);
    const updatedItem = await prisma.item.update({
      where: { id: Number(id) },
      data: body,
    });
    return updatedItem;
  } else if (method === 'DELETE') {
    // Cancella un item specifico tramite ID
    const deletedItem = await prisma.item.delete({
      where: { id: Number(id) },
    });
    return deletedItem;
  } else {
    return { error: "Method not supported" };
  }
});
