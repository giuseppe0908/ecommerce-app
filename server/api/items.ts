import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {

  const method = event.node.req.method;
   
   
    if (method === 'GET') {
        // Se è una chiamata GET, esegui la logica per recuperare i dati
        const items = await prisma.item.findMany({
          include: {
            category: true,  // Include la categoria
            brand: true,     // Include il brand
          },
        })
        return items
        
    }
    else if(method === 'POST') {
        // Se è una chiamata POST, puoi ad esempio creare un nuovo item
        const body = await readBody(event)
         // Legge il body della richiesta
        const newItem = await prisma.item.create({
            data: body,
        })
        return newItem
        
    }
    else if (method === 'DELETE') {
      const body = await readBody(event);
      console.log("Request body:", body);
        try {
            const { id } = await readBody(event)
            console.log(id);
            
            await prisma.item.delete({
              where: { id },
            });
          } catch (error) {
              console.log(error);
          }
    } 
  
})
