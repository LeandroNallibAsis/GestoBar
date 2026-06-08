import { prisma } from '../../prisma';

// Repository layer for category persistence and queries.
export const categoryRepository = {
  listByBusiness: async (businessId: string) => {
    return prisma.category.findMany({
      where: { businessId, isActive: true },
      include: { products: { where: { isActive: true } } },
      orderBy: { name: 'asc' }
    });
  },

  findById: async (id: string, businessId: string) => {
    return prisma.category.findFirst({
      where: { id, businessId },
      include: { products: { where: { isActive: true } } }
    });
  },

  createCategory: async (data: { name: string; businessId: string }) => {
    return prisma.category.create({
      data: {
        name: data.name,
        businessId: data.businessId,
        isActive: true
      },
      include: { products: true }
    });
  },

  updateCategory: async (id: string, businessId: string, data: { name?: string }) => {
    const result = await prisma.category.updateMany({
      where: { id, businessId },
      data
    });

    if (result.count === 0) {
      throw new Error('Category not found');
    }

    const updated = await prisma.category.findUnique({
      where: { id },
      include: { products: { where: { isActive: true } } }
    });

    if (!updated) {
      throw new Error('Category not found after update');
    }

    return updated;
  },

  deactivateCategory: async (id: string, businessId: string) => {
    return prisma.category.updateMany({
      where: { id, businessId },
      data: { isActive: false }
    }).then(async (result) => {
      if (result.count === 0) {
        throw new Error('Category not found');
      }
      const category = await prisma.category.findUnique({
        where: { id },
        include: { products: true }
      });
      if (!category) {
        throw new Error('Category not found after update');
      }
      return category;
    });
  }
};
