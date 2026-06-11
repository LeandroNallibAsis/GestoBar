import type { OrderStatus, OrderType } from '@prisma/client';
import { orderRepository } from './order.repository';

// Service layer for order business logic.
// This module encapsulates validation and order state management.
export class OrderService {
  static async listOrders(businessId: string) {
    return orderRepository.listByBusiness(businessId);
  }

  static async getOrderById(id: string, businessId: string) {
    return orderRepository.findById(id, businessId);
  }

  static async createOrder(data: {
    businessId: string;
    waiterId: string;
    type: OrderType;
    tableId?: string;
    deliveryAddress?: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    if (data.type === 'TABLE' && !data.tableId) {
      throw new Error('Table orders require a tableId');
    }

    return orderRepository.createOrder(data);
  }

  static async updateOrder(id: string, businessId: string, data: { status?: OrderStatus; tableId?: string }) {
    return orderRepository.updateOrder(id, businessId, data);
  }

  static async closeOrder(id: string, businessId: string) {
    return orderRepository.updateOrder(id, businessId, { status: 'PAID' });
  }

  static async cancelOrder(id: string, businessId: string) {
    return orderRepository.updateOrder(id, businessId, { status: 'CANCELLED' });
  }

  static async deleteOrder(id: string, businessId: string) {
    return orderRepository.deleteOrder(id, businessId);
  }
}
