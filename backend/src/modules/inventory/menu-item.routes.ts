import type { FastifyInstance } from 'fastify';
import { MenuItemService } from './menu-item.service';
import { JwtUser } from '../auth/auth.types';
import {
  createMenuItemBodySchema,
  MenuItemListResponseSchema,
  MenuItemResponseSchema,
  updateMenuItemBodySchema,
  MenuItemParamsSchema
} from './menu-item.schema';

export async function MenuItemRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.get(
    '/menu-items',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: MenuItemListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return MenuItemService.listMenuItems(user.businessId);
    }
  );

  server.get(
    '/menu-items/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: MenuItemParamsSchema,
        response: {
          200: MenuItemResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const MenuItem = await MenuItemService.getMenuItemById(id, user.businessId);
      if (!MenuItem) {
        return reply.status(404).send({ message: 'MenuItem not found' });
      }
      return MenuItem;
    }
  );

  server.post(
    '/menu-items',
    {
      preValidation: [authenticate],
      schema: {
        body: createMenuItemBodySchema,
        response: {
          201: MenuItemResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { name, description, price, categoryId } = request.body as {
        name: string;
        description?: string;
        price: number;
        categoryId?: string;
      };

      const MenuItem = await MenuItemService.createMenuItem({
        name,
        description,
        price,
        categoryId,
        businessId: user.businessId
      });

      return reply.status(201).send(MenuItem);
    }
  );

  server.patch(
    '/menu-items/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: MenuItemParamsSchema,
        body: updateMenuItemBodySchema,
        response: {
          200: MenuItemResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const { name, description, price, categoryId, isActive } = request.body as {
        name?: string;
        description?: string;
        price?: number;
        categoryId?: string;
        isActive?: boolean;
      };

      const updated = await MenuItemService.updateMenuItem(id, user.businessId, {
        name,
        description,
        price,
        categoryId,
        isActive
      });

      return reply.send(updated);
    }
  );

  server.delete(
    '/menu-items/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: MenuItemParamsSchema
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      await MenuItemService.updateMenuItem(id, user.businessId, { isActive: false });
      return reply.send({ success: true });
    }
  );
}

