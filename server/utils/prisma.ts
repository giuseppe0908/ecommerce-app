import { PrismaClient, type Prisma } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prismaLogs: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'];
const databaseUrl = (process.env.DATABASE_URL || '').trim();
const isAccelerateUrl = databaseUrl.startsWith('prisma://');

function createPrismaClient() {
  const client = new PrismaClient({
    log: prismaLogs,
  });

  // Local development keeps a direct MySQL connection.
  // Preview/production on Vercel should use a pooled prisma:// URL via Accelerate.
  return isAccelerateUrl ? client.$extends(withAccelerate()) : client;
}

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientInstance;
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
