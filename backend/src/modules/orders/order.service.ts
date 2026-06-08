import type { OrderStatus } from '@prisma/client';
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
    tableId?: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    return orderRepository.createOrder(data);
  }

  static async updateOrder(id: string, businessId: string, data: { status?: OrderStatus; tableId?: string | null }) {
    return orderRepository.updateOrder(id, businessId, data);
  }

  static async closeOrder(id: string, businessId: string) {
    return orderRepository.updateOrder(id, businessId, { status: 'CLOSED' });
  }

  static async cancelOrder(id: string, businessId: string) {
    return orderRepository.updateOrder(id, businessId, { status: 'CANCELLED' });
  }

  static async deleteOrder(id: string, businessId: string) {
    return orderRepository.deleteOrder(id, businessId);
  }
}
