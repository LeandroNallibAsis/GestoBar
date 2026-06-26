/**
 * ============================================================
 * user.repository.ts
 * ============================================================
 * Repositorio de datos. Encapsula las consultas a la base de datos.
 * Módulo: Backend / users
 * ============================================================
 */
import { prisma } from '../../prisma';
import type { User, UserRole } from '@prisma/client';

// Repository layer for user management.
export const userRepository = {
  listByBusiness: async (businessId: string): Promise<User[]> => {
    return prisma.user.findMany({ where: { businessId } });
  },

  findById: async (id: string, businessId: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { id } }).then((user) => {
      if (!user || user.businessId !== businessId) {
        return null;
      }
      return user;
    });
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
  },

  updateUser: async (id: string, businessId: string, data: Partial<Omit<User, 'id' | 'businessId' | 'createdAt'>>): Promise<User> => {
    return prisma.user.updateMany({
      where: { id, businessId },
      data
    }).then(async (result) => {
      if (result.count === 0) {
        throw new Error('User not found');
      }
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error('User not found after update');
      }
      return user;
    });
  }
};
