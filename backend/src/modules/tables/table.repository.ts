import { prisma } from '../../prisma';
import type { Table, TableStatus } from '@prisma/client';

// Repository layer for table persistence and queries.
// All database access for tables is isolated here.
export const tableRepository = {
  listByBusiness: async (businessId: string): Promise<Table[]> => {
    return prisma.table.findMany({
      where: { businessId },
      orderBy: { createdAt: 'asc' }
    });
  },

  findById: async (id: string, businessId: string): Promise<Table | null> => {
    return prisma.table.findFirst({ where: { id, businessId } });
  },

  createTable: async (data: { name: string; capacity?: number; status?: TableStatus; linkedTableId?: string; businessId: string }): Promise<Table> => {
    return prisma.table.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        status: data.status || 'FREE',
        linkedTableId: data.linkedTableId,
        businessId: data.businessId
      }
    });
  },

  updateTable: async (id: string, businessId: string, data: { name?: string; capacity?: number; status?: TableStatus; linkedTableId?: string | null }): Promise<Table> => {
    const result = await prisma.table.updateMany({
      where: { id, businessId },
      data
    });

    if (result.count === 0) {
      throw new Error('Table not found');
    }

    const updated = await prisma.table.findUnique({ where: { id } });
    if (!updated) {
      throw new Error('Table not found after update');
    }

    return updated;
  },

  deleteTable: async (id: string, businessId: string): Promise<void> => {
    const result = await prisma.table.deleteMany({ where: { id, businessId } });
    if (result.count === 0) {
      throw new Error('Table not found');
    }
  }
};
