import { prisma } from '../../prisma';

// Repository layer for product persistence and queries.
export const productRepository = {
  listByBusiness: async (businessId: string) => {
    return prisma.product.findMany({
      where: { businessId, isActive: true },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  },

  findById: async (id: string, businessId: string) => {
    return prisma.product.findFirst({
      where: { id, businessId },
      include: { category: true }
    });
  },

  createProduct: async (data: {
    name: string;
    price: number;
    stock: number;
    categoryId?: string;
    businessId: string;
  }) => {
    return prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        businessId: data.businessId,
        isActive: true
      },
      include: { category: true }
    });
  },

  updateProduct: async (
    id: string,
    businessId: string,
    data: { name?: string; price?: number; stock?: number; categoryId?: string }
  ) => {
    const result = await prisma.product.updateMany({
      where: { id, businessId },
      data
    });

    if (result.count === 0) {
      throw new Error('Product not found');
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!updated) {
      throw new Error('Product not found after update');
    }

    return updated;
  },

  deactivateProduct: async (id: string, businessId: string) => {
    return prisma.product.updateMany({
      where: { id, businessId },
      data: { isActive: false }
    }).then(async (result) => {
      if (result.count === 0) {
        throw new Error('Product not found');
      }
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true }
      });
      if (!product) {
        throw new Error('Product not found after update');
      }
      return product;
    });
  },

  decrementStock: async (id: string, businessId: string, quantity: number) => {
    return prisma.product.updateMany({
      where: { id, businessId },
      data: { stock: { decrement: quantity } }
    }).then(async (result) => {
      if (result.count === 0) {
        throw new Error('Product not found');
      }
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true }
      });
      if (!product) {
        throw new Error('Product not found after decrement');
      }
      return product;
    });
  }
};
