import { prisma } from '../../prisma';
import type { Order, OrderStatus } from '@prisma/client';

// Repository layer for order persistence and queries.
// All database access for orders is isolated here.
export const orderRepository = {
  listByBusiness: async (businessId: string) => {
    return prisma.order.findMany({
      where: { businessId },
      include: { items: { include: { product: true } }, table: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string, businessId: string) => {
    return prisma.order.findFirst({
      where: { id, businessId },
      include: { items: { include: { product: true } }, table: true }
    });
  },

  createOrder: async (data: {
    businessId: string;
    tableId?: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) => {
    const itemTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return prisma.order.create({
      data: {
        businessId: data.businessId,
        tableId: data.tableId,
        total: itemTotal,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: { include: { product: true } }, table: true }
    });
  },

  updateOrder: async (id: string, businessId: string, data: { status?: OrderStatus; tableId?: string | null }) => {
    return prisma.order.updateMany({
      where: { id, businessId },
      data
    }).then(async (result) => {
      if (result.count === 0) {
        throw new Error('Order not found');
      }
      const updated = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } }, table: true }
      });
      if (!updated) {
        throw new Error('Order not found after update');
      }
      return updated;
    });
  },

  deleteOrder: async (id: string, businessId: string) => {
    const result = await prisma.order.deleteMany({ where: { id, businessId } });
    if (result.count === 0) {
      throw new Error('Order not found');
    }
  }
};
