/**
 * ============================================================
 * inventory-item.repository.ts
 * ============================================================
 * Repositorio de datos. Encapsula las consultas a la base de datos.
 * Módulo: Backend / inventory
 * ============================================================
 */
import { prisma } from '../../prisma';

// Repository layer for InventoryItem persistence and queries.
export const InventoryItemRepository = {
  listByBusiness: async (businessId: string) => {
    return prisma.inventoryItem.findMany({
      where: { businessId },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  },

  findById: async (id: string, businessId: string) => {
    return prisma.inventoryItem.findFirst({
      where: { id, businessId },
      include: { category: true }
    });
  },

  createInventoryItem: async (data: {
    name: string;
    unit?: string;
    cost: number;
    stock?: number;
    categoryId?: string;
    businessId: string;
  }) => {
    return prisma.inventoryItem.create({
      data: {
        name: data.name,
        unit: data.unit,
        cost: data.cost,
        stock: data.stock || 0,
        categoryId: data.categoryId,
        businessId: data.businessId,
        isActive: true
      },
      include: { category: true }
    });
  },

  updateInventoryItem: async (
    id: string,
    businessId: string,
    data: { name?: string; cost?: number; unit?: string; stock?: number; categoryId?: string; isActive?: boolean }
  ) => {
    const result = await prisma.inventoryItem.updateMany({
      where: { id, businessId },
      data
    });

    if (result.count === 0) {
      throw new Error('InventoryItem not found');
    }

    const updated = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!updated) {
      throw new Error('InventoryItem not found after update');
    }

    return updated;
  },

};
