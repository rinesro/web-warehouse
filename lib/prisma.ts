import { PrismaClient as StandardPrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const ExtendedPrismaClient = new StandardPrismaClient().$extends(withAccelerate());
export type ExtendedPrismaClientType = typeof ExtendedPrismaClient;

const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrismaClientType | undefined }; // Gunakan tipe extended

export const prisma =
  globalForPrisma.prisma || ExtendedPrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;