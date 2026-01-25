import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add pgbouncer and connection pool parameters for Supabase
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  const params: string[] = [];
  // Required for Supabase connection pooler (pgbouncer in transaction mode)
  if (!url.includes('pgbouncer=true')) params.push('pgbouncer=true');
  // Limit connections to avoid pool exhaustion
  if (!url.includes('connection_limit=')) params.push('connection_limit=1');
  // Reduce pool timeout for faster recovery
  if (!url.includes('pool_timeout=')) params.push('pool_timeout=10');
  // Set connect timeout
  if (!url.includes('connect_timeout=')) params.push('connect_timeout=10');

  if (params.length === 0) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.join('&')}`;
};

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances during hot reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Gracefully disconnect on process termination
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
