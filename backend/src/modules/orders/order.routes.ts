/**
 * ============================================================
 * order.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) para la gestión de pedidos
 * del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   GET    /orders           - Listar todos los pedidos del negocio
 *   GET    /orders/:id       - Obtener un pedido específico por ID
 *   POST   /orders           - Crear un nuevo pedido con ítems
 *   PATCH  /orders/:id       - Actualizar estado o mesa de un pedido
 *   POST   /orders/:id/close - Cerrar un pedido (marcar como pagado)
 *   POST   /orders/:id/cancel - Cancelar un pedido
 *   DELETE /orders/:id       - Eliminar un pedido permanentemente
 *
 * Todos los endpoints requieren autenticación JWT y operan
 * dentro del alcance del negocio del usuario autenticado.
 *
 * Tabla(s) relacionada(s): Order, OrderItem
 * Módulo: Pedidos (orders)
 * ============================================================
 */

import type { FastifyInstance } from 'fastify';
import { OrderService } from './order.service';
import { JwtUser } from '../auth/auth.types';
import {
  createOrderBodySchema,
  orderListResponseSchema,
  orderResponseSchema,
  updateOrderBodySchema,
  updateOrderParamsSchema
} from './order.schema';

/**
 * Registra las rutas de gestión de pedidos en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación
 */
// Register order management routes for business-scoped orders.
export async function orderRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── GET /orders ───────────────────────────────────────────
  // Lista todos los pedidos del negocio del usuario autenticado.
  server.get(
    '/orders',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: orderListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return OrderService.listOrders(user.businessId);
    }
  );

  // ── GET /orders/:id ───────────────────────────────────────
  // Obtiene un pedido específico por su ID.
  // Devuelve 404 si el pedido no existe en el negocio.
  server.get(
    '/orders/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: updateOrderParamsSchema,
        response: {
          200: orderResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const order = await OrderService.getOrderById(id, user.businessId);
      if (!order) {
        return reply.status(404).send({ message: 'Order not found' });
      }
      return order;
    }
  );

  // ── POST /orders ──────────────────────────────────────────
  // Crea un nuevo pedido con sus ítems.
  // El mesero (waiterId) se obtiene del token JWT del usuario autenticado.
  // El tipo de pedido (type) determina si se requiere tableId o deliveryAddress.
  server.post(
    '/orders',
    {
      preValidation: [authenticate],
      schema: {
        body: createOrderBodySchema,
        response: {
          200: orderResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { tableId, type, deliveryAddress, items } = request.body as {
        tableId?: string;
        type: string;
        deliveryAddress?: string;
        items: Array<{ productId: string; quantity: number; price: number }>;
      };

      // Crea el pedido asociando al negocio y mesero del usuario autenticado
      const order = await OrderService.createOrder({
        businessId: user.businessId,
        tableId,
        waiterId: user.sub,
        type: (type || 'TABLE') as any, // Si no se especifica tipo, por defecto es TABLE
        deliveryAddress,
        items
      });

      return reply.status(201).send(order);
    }
  );

  // ── PATCH /orders/:id ─────────────────────────────────────
  // Actualiza parcialmente un pedido existente.
  // Permite cambiar el estado (status) y/o la mesa asignada (tableId).
  server.patch(
    '/orders/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: updateOrderParamsSchema,
        body: updateOrderBodySchema,
        response: {
          200: orderResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const { status, tableId } = request.body as { status?: string; tableId?: string };

      const updated = await OrderService.updateOrder(id, user.businessId, {
        status: status as any,
        tableId
      });

      return reply.send(updated);
    }
  );

  // ── POST /orders/:id/close ────────────────────────────────
  // Cierra un pedido, marcándolo como pagado (estado PAID).
  // Acción específica que no requiere enviar un body con el estado.
  server.post(
    '/orders/:id/close',
    {
      preValidation: [authenticate],
      schema: {
        params: updateOrderParamsSchema,
        response: {
          200: orderResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const closed = await OrderService.closeOrder(id, user.businessId);
      return reply.send(closed);
    }
  );

  // ── POST /orders/:id/cancel ───────────────────────────────
  // Cancela un pedido, cambiando su estado a CANCELLED.
  // Acción específica que no requiere enviar un body con el estado.
  server.post(
    '/orders/:id/cancel',
    {
      preValidation: [authenticate],
      schema: {
        params: updateOrderParamsSchema,
        response: {
          200: orderResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const cancelled = await OrderService.cancelOrder(id, user.businessId);
      return reply.send(cancelled);
    }
  );

  // ── DELETE /orders/:id ────────────────────────────────────
  // Elimina un pedido de forma permanente de la base de datos.
  server.delete(
    '/orders/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: updateOrderParamsSchema
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      await OrderService.deleteOrder(id, user.businessId);
      return reply.send({ success: true });
    }
  );
}
