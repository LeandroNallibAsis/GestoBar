/**
 * ============================================================
 * menu-item.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) para la gestión de ítems
 * del menú del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   GET    /menu-items      - Listar todos los ítems del menú
 *   GET    /menu-items/:id  - Obtener un ítem específico por ID
 *   POST   /menu-items      - Crear un nuevo ítem del menú
 *   PATCH  /menu-items/:id  - Actualizar un ítem existente
 *   DELETE /menu-items/:id  - Desactivar un ítem (soft delete)
 *
 * Nota: La eliminación es lógica (soft delete), cambiando isActive
 * a false en lugar de eliminar físicamente el registro, para
 * mantener la integridad con pedidos históricos.
 *
 * Todos los endpoints requieren autenticación JWT.
 *
 * Tabla(s) relacionada(s): MenuItem, Category
 * Módulo: Inventario (inventory)
 * ============================================================
 */

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

/**
 * Registra las rutas de gestión de ítems del menú en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación
 */
export async function MenuItemRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── GET /menu-items ───────────────────────────────────────
  // Lista todos los ítems del menú del negocio.
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

  // ── GET /menu-items/:id ───────────────────────────────────
  // Obtiene un ítem del menú específico por su ID.
  // Devuelve 404 si el ítem no existe en el negocio.
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

  // ── POST /menu-items ──────────────────────────────────────
  // Crea un nuevo ítem del menú en el negocio.
  // Requiere nombre y precio; descripción y categoría son opcionales.
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

      // Crea el ítem del menú asociado al negocio del usuario autenticado
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

  // ── PATCH /menu-items/:id ─────────────────────────────────
  // Actualiza parcialmente un ítem del menú existente.
  // Permite modificar nombre, descripción, precio, categoría y estado.
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

  // ── DELETE /menu-items/:id ────────────────────────────────
  // Desactiva un ítem del menú (eliminación lógica / soft delete).
  // En lugar de eliminar el registro, cambia isActive a false para
  // preservar la referencia en pedidos históricos.
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
      // Soft delete: desactiva el ítem en lugar de eliminarlo físicamente
      await MenuItemService.updateMenuItem(id, user.businessId, { isActive: false });
      return reply.send({ success: true });
    }
  );
}
