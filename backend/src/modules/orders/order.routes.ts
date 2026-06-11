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

// Register order management routes for business-scoped orders.
export async function orderRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

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

      const order = await OrderService.createOrder({
        businessId: user.businessId,
        tableId,
        waiterId: user.sub,
        type: (type || 'TABLE') as any,
        deliveryAddress,
        items
      });

      return reply.status(201).send(order);
    }
  );

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
