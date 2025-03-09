import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = query.q?.toLowerCase() // Convertiamo in minuscolo
  
  if (!searchTerm || searchTerm.length < 2) {
    return []
  }

  try {
    const results = await prisma.$transaction([
      // Cerca nei prodotti
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } }
          ]
        },
        include: {
          brand: true,
          category: true
        },
        take: 5
      }),
      // Cerca nei brand
      prisma.brand.findMany({
        where: {
          name: { contains: searchTerm }
        },
        take: 3
      })
    ])

    return {
      products: results[0],
      brands: results[1]
    }
  } catch (error) {
    console.error('Errore nella ricerca:', error)
    return { error: 'Errore durante la ricerca' }
  }
})