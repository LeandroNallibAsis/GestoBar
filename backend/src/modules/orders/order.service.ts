/**
 * ============================================================
 * order.service.ts
 * ============================================================
 * Servicio de gestión de pedidos (órdenes) del sistema GestoBar.
 * Contiene la lógica de negocio para crear, listar, actualizar,
 * cerrar, cancelar y eliminar pedidos.
 *
 * Reglas de negocio importantes:
 *   - Todo pedido debe tener al menos un ítem.
 *   - Los pedidos de tipo "TABLE" requieren un tableId obligatorio.
 *   - Cerrar un pedido cambia su estado a "PAID".
 *   - Cancelar un pedido cambia su estado a "CANCELLED".
 *
 * Tabla(s) relacionada(s): Order, OrderItem
 * Módulo: Pedidos (orders)
 * ============================================================
 */

import type { OrderStatus, OrderType } from '@prisma/client';
import { orderRepository } from './order.repository';

/**
 * Servicio estático de pedidos.
 * Encapsula la validación y gestión del estado de los pedidos.
 */
// Service layer for order business logic.
// This module encapsulates validation and order state management.
export class OrderService {
  /**
   * Lista todos los pedidos de un negocio.
   *
   * @param businessId - ID del negocio
   * @returns Array con todos los pedidos del negocio
   */
  static async listOrders(businessId: string) {
    return orderRepository.listByBusiness(businessId);
  }

  /**
   * Obtiene un pedido específico por su ID dentro de un negocio.
   *
   * @param id - ID del pedido
   * @param businessId - ID del negocio (para filtrado por alcance)
   * @returns El pedido encontrado o null si no existe
   */
  static async getOrderById(id: string, businessId: string) {
    return orderRepository.findById(id, businessId);
  }

  /**
   * Crea un nuevo pedido con sus ítems asociados.
   * Valida que el pedido tenga al menos un ítem y que
   * los pedidos de tipo "TABLE" incluyan un tableId.
   *
   * @param data - Datos del pedido a crear
   * @param data.businessId - ID del negocio
   * @param data.waiterId - ID del mesero que toma el pedido
   * @param data.type - Tipo de pedido (TABLE, DELIVERY, TAKEAWAY)
   * @param data.tableId - ID de la mesa (obligatorio si type es TABLE)
   * @param data.deliveryAddress - Dirección de entrega (para pedidos delivery)
   * @param data.items - Array de ítems con productId, cantidad y precio
   * @returns El pedido creado con sus ítems
   * @throws Error si no hay ítems o si falta el tableId en pedidos de mesa
   */
  static async createOrder(data: {
    businessId: string;
    waiterId: string;
    type: OrderType;
    tableId?: string;
    deliveryAddress?: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) {
    // Validación: el pedido debe tener al menos un ítem
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    // Validación: los pedidos de tipo mesa requieren un ID de mesa
    if (data.type === 'TABLE' && !data.tableId) {
      throw new Error('Table orders require a tableId');
    }

    return orderRepository.createOrder(data);
  }

  /**
   * Actualiza un pedido existente (estado y/o mesa asignada).
   *
   * @param id - ID del pedido a actualizar
   * @param businessId - ID del negocio
   * @param data - Datos a actualizar (status y/o tableId)
   * @returns El pedido actualizado
   */
  static async updateOrder(id: string, businessId: string, data: { status?: OrderStatus; tableId?: string }) {
    return orderRepository.updateOrder(id, businessId, data);
  }

  /**
   * Cierra un pedido marcándolo como pagado (estado PAID).
   *
   * @param id - ID del pedido a cerrar
   * @param businessId - ID del negocio
   * @returns El pedido actualizado con estado PAID
   */
  static async closeOrder(id: string, businessId: string) {
    return orderRepository.updateOrder(id, businessId, { status: 'PAID' });
  }

  /**
   * Cancela un pedido cambiando su estado a CANCELLED.
   *
   * @param id - ID del pedido a cancelar
   * @param businessId - ID del negocio
   * @returns El pedido actualizado con estado CANCELLED
   */
  static async cancelOrder(id: string, businessId: string) {
    return orderRepository.updateOrder(id, businessId, { status: 'CANCELLED' });
  }

  /**
   * Elimina un pedido de la base de datos de forma permanente.
   *
   * @param id - ID del pedido a eliminar
   * @param businessId - ID del negocio
   * @returns Resultado de la eliminación
   */
  static async deleteOrder(id: string, businessId: string) {
    return orderRepository.deleteOrder(id, businessId);
  }
}
