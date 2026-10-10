import { PrismaClient } from "@prisma/client";

/** Used only when DATABASE_URL is configured. Demo mode never imports this file. */
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
