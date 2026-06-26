/**
 * ============================================================
 * menu-item.repository.ts
 * ============================================================
 * Repositorio de datos. Encapsula las consultas a la base de datos.
 * Módulo: Backend / inventory
 * ============================================================
 */
import { prisma } from '../../prisma';

// Repository layer for MenuItem persistence and queries.
export const MenuItemRepository = {
  listByBusiness: async (businessId: string) => {
    return prisma.menuItem.findMany({
      where: { businessId },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  },

  findById: async (id: string, businessId: string) => {
    return prisma.menuItem.findFirst({
      where: { id, businessId },
      include: { category: true }
    });
  },

  createMenuItem: async (data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    businessId: string;
  }) => {
    return prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        businessId: data.businessId,
        isActive: true
      },
      include: { category: true }
    });
  },

  updateMenuItem: async (
    id: string,
    businessId: string,
    data: { name?: string; price?: number; description?: string; categoryId?: string; isActive?: boolean }
  ) => {
    const result = await prisma.menuItem.updateMany({
      where: { id, businessId },
      data
    });

    if (result.count === 0) {
      throw new Error('MenuItem not found');
    }

    const updated = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!updated) {
      throw new Error('MenuItem not found after update');
    }

    return updated;
  },

};
