import { PrismaClient, type Prisma } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prismaLogs: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'];
const stripWrappingQuotes = (value: string) => {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const databaseUrl = stripWrappingQuotes(process.env.DATABASE_URL || '');
const isAccelerateUrl = databaseUrl.startsWith('prisma://');

function createPrismaClient() {
  const client = new PrismaClient({
    ...(databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : {}),
    log: prismaLogs,
  });

  // Local development keeps a direct PostgreSQL connection.
  // Preview/production can use Neon directly, or prisma:// via Accelerate if configured.
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
