import { prisma } from '../../prisma';

export const categoryRepository = {
  listByBusiness: async (businessId: string) => {
    return prisma.category.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: 'asc' }
    });
  },

  findById: async (id: string, businessId: string) => {
    return prisma.category.findFirst({
      where: { id, businessId }
    });
  },

  create: async (data: { name: string; businessId: string }) => {
    return prisma.category.create({
      data: {
        name: data.name,
        businessId: data.businessId,
        isActive: true
      }
    });
  },

  update: async (id: string, businessId: string, data: { name?: string; isActive?: boolean }) => {
    const result = await prisma.category.updateMany({
      where: { id, businessId },
      data
    });

    if (result.count === 0) throw new Error('Category not found');

    return prisma.category.findUnique({
      where: { id }
    });
  },

  delete: async (id: string, businessId: string) => {
    const result = await prisma.category.updateMany({
      where: { id, businessId },
      data: { isActive: false }
    });

    if (result.count === 0) throw new Error('Category not found');

    return { success: true };
  }
};