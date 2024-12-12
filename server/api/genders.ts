import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {
    
    const method = event.node.req.method;
    if (method === 'GET') {
        // Se è una chiamata GET, esegui la logica per recuperare i dati
        console.time('fetchGenders');
        const genders = await prisma.gender.findMany({})    
        console.timeEnd('fetchGenders'); 
        return genders
    }
    else if(method === 'POST') {
        // Se è una chiamata POST, puoi ad esempio creare un nuovo item
        const body = await readBody(event)
        // Legge il body della richiesta
        const newGender = await prisma.gender.create({
            data: body,
        })
        return newGender
        
    }
})    