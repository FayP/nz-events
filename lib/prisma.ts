import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add pgbouncer parameter for Supabase connection pooler
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  // Add pgbouncer=true if not already present
  if (url.includes('pgbouncer=true')) return url;
  return url.includes('?') ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

// Prevent multiple instances during hot reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Gracefully disconnect on process termination
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
