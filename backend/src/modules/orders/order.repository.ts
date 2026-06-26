/**
 * ============================================================
 * ORDER.REPOSITORY.TS
 * ============================================================
 * Capa de acceso a datos para el módulo de pedidos.
 * Gestiona todas las operaciones CRUD de pedidos (Order) y
 * sus ítems (OrderItem) en la base de datos.
 *
 * Los pedidos incluyen relaciones con:
 * - OrderItem + MenuItem (productos del pedido)
 * - Table (mesa asociada, si aplica)
 * - User/Waiter (mesero que atiende)
 *
 * Tabla(s) relacionada(s): Order, OrderItem, MenuItem, Table, User
 * Módulo: Pedidos (Orders)
 * ============================================================
 */

import { prisma } from '../../prisma';
import type { OrderStatus, OrderType } from '@prisma/client';

// Repository layer for order persistence and queries.
// All database access for orders is isolated here.
export const orderRepository = {
  /**
   * Lista todos los pedidos de un negocio, ordenados del más reciente al más antiguo.
   * Incluye los ítems con datos del producto, la mesa y datos básicos del mesero.
   *
   * @param businessId - ID del negocio (filtro multi-tenancy)
   * @returns Array de pedidos con sus relaciones incluidas
   */
  listByBusiness: async (businessId: string) => {
    return prisma.order.findMany({
      where: { businessId },
      include: { items: { include: { product: true } }, table: true, waiter: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Busca un pedido específico por ID dentro de un negocio.
   * Usa findFirst con filtro de businessId para garantizar aislamiento multi-tenant.
   *
   * @param id - UUID del pedido
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @returns El pedido con sus relaciones o null si no existe
   */
  findById: async (id: string, businessId: string) => {
    return prisma.order.findFirst({
      where: { id, businessId },
      include: { items: { include: { product: true } }, table: true, waiter: { select: { id: true, name: true } } }
    });
  },

  /**
   * Crea un nuevo pedido con sus ítems en una sola transacción.
   * Calcula el total sumando (precio × cantidad) de cada ítem.
   * Los ítems del pedido se crean mediante create anidado de Prisma.
   *
   * @param data - Datos del pedido a crear
   * @param data.businessId - ID del negocio
   * @param data.waiterId - ID del mesero que atiende
   * @param data.type - Tipo de pedido (TABLE, TAKEAWAY, DELIVERY)
   * @param data.tableId - ID de la mesa (opcional, solo para TABLE)
   * @param data.deliveryAddress - Dirección de entrega (opcional, solo para DELIVERY)
   * @param data.items - Array de productos con productId, quantity y price
   * @returns El pedido creado con todas sus relaciones
   */
  createOrder: async (data: {
    businessId: string;
    waiterId: string;
    type: OrderType;
    tableId?: string;
    deliveryAddress?: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) => {
    // Calcula el total del pedido sumando precio × cantidad de cada ítem
    const itemTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return prisma.order.create({
      data: {
        businessId: data.businessId,
        tableId: data.tableId,
        waiterId: data.waiterId,
        type: data.type,
        deliveryAddress: data.deliveryAddress,
        total: itemTotal,
        items: {
          // Crea los ítems del pedido de forma anidada (transacción implícita)
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: { include: { product: true } }, table: true, waiter: { select: { id: true, name: true } } }
    });
  },

  /**
   * Actualiza un pedido existente (estado y/o mesa asignada).
   * Usa updateMany con filtro de businessId para seguridad multi-tenant.
   * Después de actualizar, busca y retorna el pedido completo con relaciones.
   *
   * @param id - UUID del pedido a actualizar
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @param data - Campos a actualizar (status y/o tableId)
   * @returns El pedido actualizado con sus relaciones
   * @throws Error si el pedido no se encuentra
   */
  updateOrder: async (id: string, businessId: string, data: { status?: OrderStatus; tableId?: string }) => {
    // Construye dinámicamente el objeto de actualización solo con los campos proporcionados
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tableId !== undefined) updateData.tableId = data.tableId;

    return prisma.order.updateMany({
      where: { id, businessId },
      data: updateData
    }).then(async (result) => {
      // Verifica que se actualizó al menos un registro
      if (result.count === 0) {
        throw new Error('Order not found');
      }
      // Busca el pedido actualizado para retornarlo con sus relaciones
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

  /**
   * Elimina un pedido por ID dentro de un negocio.
   * Usa deleteMany con filtro de businessId para seguridad multi-tenant.
   *
   * @param id - UUID del pedido a eliminar
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @throws Error si el pedido no se encuentra
   */
  deleteOrder: async (id: string, businessId: string) => {
    const result = await prisma.order.deleteMany({ where: { id, businessId } });
    if (result.count === 0) {
      throw new Error('Order not found');
    }
  }
};
