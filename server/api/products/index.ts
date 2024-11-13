import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {

  const method = event.node.req.method;
    if (method === 'GET') {
        const products = await prisma.product.findMany({
          include: {
            category: true,  
            brand: true, 
            gender: true,
            // reviews: true    
          },
        })
        return products
        
    }
    else if(method === 'POST') {
        const body = await readBody(event)
         // Legge il body della richiesta
        const newProduct = await prisma.product.create({
            data: body,
        })
        return newProduct
        
    }
    else if (method === 'DELETE') {
      const body = await readBody(event);
        try {
            const { id } = await readBody(event)
            await prisma.product.delete({
              where: { id },
            });
          } catch (error) {
              console.log(error);
          }
    } 
  
})
