/**
 * ============================================================
 * inventory-item.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) para la gestión de ítems
 * de inventario (insumos/materias primas) del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   GET    /inventory-items      - Listar todos los ítems de inventario
 *   GET    /inventory-items/:id  - Obtener un ítem específico por ID
 *   POST   /inventory-items      - Crear un nuevo ítem de inventario
 *   PATCH  /inventory-items/:id  - Actualizar un ítem existente
 *   DELETE /inventory-items/:id  - Desactivar un ítem (soft delete)
 *
 * Nota: La eliminación es lógica (soft delete), cambiando isActive a false
 * en lugar de eliminar físicamente el registro.
 *
 * Todos los endpoints requieren autenticación JWT.
 *
 * Tabla(s) relacionada(s): InventoryItem, Category
 * Módulo: Inventario (inventory)
 * ============================================================
 */

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

/**
 * Registra las rutas de gestión de ítems de inventario en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación
 */
export async function InventoryItemRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── GET /inventory-items ──────────────────────────────────
  // Lista todos los ítems de inventario del negocio.
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

  // ── GET /inventory-items/:id ──────────────────────────────
  // Obtiene un ítem de inventario específico por su ID.
  // Devuelve 404 si el ítem no existe en el negocio.
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

  // ── POST /inventory-items ─────────────────────────────────
  // Crea un nuevo ítem de inventario en el negocio.
  // Requiere nombre y costo; unidad, stock y categoría son opcionales.
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

      // Crea el ítem asociado al negocio del usuario autenticado
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

  // ── PATCH /inventory-items/:id ────────────────────────────
  // Actualiza parcialmente un ítem de inventario existente.
  // Permite modificar nombre, unidad, costo, stock, categoría y estado.
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

  // ── DELETE /inventory-items/:id ───────────────────────────
  // Desactiva un ítem de inventario (eliminación lógica / soft delete).
  // En lugar de eliminar el registro, cambia isActive a false para
  // mantener la integridad referencial con pedidos existentes.
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
      // Soft delete: desactiva el ítem en lugar de eliminarlo físicamente
      await InventoryItemService.updateInventoryItem(id, user.businessId, { isActive: false });
      return reply.send({ success: true });
    }
  );
}
