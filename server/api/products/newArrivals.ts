import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  return await prisma.product.findMany({
    where: {
      newArrival: true,
    },
    include: {
      category: true,
      brand: true,
      gender: true,
    },
    // orderBy: {
    //   createdAt: 'desc', // Per mostrare i più recenti per primi
    // },
  });
});
