import { PrismaClient } from '@prisma/client';

// Single Prisma client instance for the backend application.
export const prisma = new PrismaClient();
