import { prisma } from '../../prisma';
import type { User, UserRole } from '@prisma/client';

// Repository responsible for user persistence and retrieval.
// All database queries are isolated here to keep service logic clean.
export const authRepository = {
  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findFirst({ where: { email, isActive: true } });
  },

  findById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser: async (data: {
    email: string;
    name?: string;
    password: string;
    role: UserRole;
    businessId: string;
  }): Promise<User> => {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name ?? data.email.split('@')[0],
        password: data.password,
        role: data.role,
        businessId: data.businessId
      }
    });
  }
};
