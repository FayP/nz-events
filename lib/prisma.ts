import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Fix for "prepared statement already exists" error in development
    datasourceUrl: process.env.DATABASE_URL,
  });

// Prevent multiple instances during hot reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Gracefully disconnect on process termination
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
