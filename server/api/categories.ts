
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {

  const method = event.node.req.method;
   
   
    if (method === 'GET') {
        // Se è una chiamata GET, esegui la logica per recuperare i dati
        const categories = await prisma.category.findMany({
            include: {
              images: true,  
              
            },
          })     
        return categories
        
    }
    else if(method === 'POST') {
        // Se è una chiamata POST, puoi ad esempio creare un nuovo item
        const body = await readBody(event)
        console.log(body);
         // Legge il body della richiesta
        const newCategory = await prisma.category.create({
            data: body,
        })
        return newCategory
        
    }
    // else if (method === 'DELETE') {
        
    //     try {
    //         const { id } = await readBody(event)
    //         await prisma.item.delete({
    //         where: { id: Number(id) },
    //         });
    //         console.log("elemento eleiminato" + id);
            
    //         // return res.json({ message: 'Item eliminato' });
    //     } catch (error) {
    //         console.log(error);
            
    //         // return res.status(404).json({ error: 'Item not found' });
    //     }
    // } 
  
})
