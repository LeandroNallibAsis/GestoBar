import type { FastifyInstance } from 'fastify';
import { InventoryItemService } from './inventory-item.service';
import { JwtUser } from '../auth/auth.types';
import {
  createInventoryItemBodySchema,
  InventoryItemListResponseSchema,
  InventoryItemResponseSchema,
  updateInventoryItemBodySchema,
  InventoryItemParamsSchema
} from './inventory-item.schema';

export async function InventoryItemRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.get(
    '/inventory-items',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: InventoryItemListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return InventoryItemService.listInventoryItems(user.businessId);
    }
  );

  server.get(
    '/inventory-items/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: InventoryItemParamsSchema,
        response: {
          200: InventoryItemResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const InventoryItem = await InventoryItemService.getInventoryItemById(id, user.businessId);
      if (!InventoryItem) {
        return reply.status(404).send({ message: 'InventoryItem not found' });
      }
      return InventoryItem;
    }
  );

  server.post(
    '/inventory-items',
    {
      preValidation: [authenticate],
      schema: {
        body: createInventoryItemBodySchema,
        response: {
          201: InventoryItemResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { name, unit, cost, stock, categoryId } = request.body as {
        name: string;
        unit?: string;
        cost: number;
        stock?: number;
        categoryId?: string;
      };

      const InventoryItem = await InventoryItemService.createInventoryItem({
        name,
        unit,
        cost,
        stock,
        categoryId,
        businessId: user.businessId
      });

      return reply.status(201).send(InventoryItem);
    }
  );

  server.patch(
    '/inventory-items/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: InventoryItemParamsSchema,
        body: updateInventoryItemBodySchema,
        response: {
          200: InventoryItemResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const { name, unit, cost, stock, categoryId, isActive } = request.body as {
        name?: string;
        unit?: string;
        cost?: number;
        stock?: number;
        categoryId?: string;
        isActive?: boolean;
      };

      const updated = await InventoryItemService.updateInventoryItem(id, user.businessId, {
        name,
        unit,
        cost,
        stock,
        categoryId,
        isActive
      });

      return reply.send(updated);
    }
  );

  server.delete(
    '/inventory-items/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: InventoryItemParamsSchema
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      await InventoryItemService.updateInventoryItem(id, user.businessId, { isActive: false });
      return reply.send({ success: true });
    }
  );
}

