import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {

  const method = event.node.req.method;
    if (method === 'GET') {
        const items = await prisma.item.findMany({
          include: {
            category: true,  // Include la categoria
            brand: true,     // Include il brand
          },
        })
        return items
        
    }
    else if(method === 'POST') {
        const body = await readBody(event)
         // Legge il body della richiesta
        const newItem = await prisma.item.create({
            data: body,
        })
        return newItem
        
    }
    else if (method === 'DELETE') {
      const body = await readBody(event);
        try {
            const { id } = await readBody(event)
            await prisma.item.delete({
              where: { id },
            });
          } catch (error) {
              console.log(error);
          }
    } 
  
})
