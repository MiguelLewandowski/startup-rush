import { PrismaClient } from '@prisma/client';

// PrismaClient é anexado ao namespace global em desenvolvimento
// para evitar que conexões exaustivas sejam criadas no hot-reloading

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 