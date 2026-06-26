/**
 * ============================================================
 * table.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) para la gestión de mesas
 * del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   GET    /tables      - Listar todas las mesas del negocio
 *   GET    /tables/:id  - Obtener una mesa específica por ID
 *   POST   /tables      - Crear una nueva mesa (solo roles autorizados)
 *   PATCH  /tables/:id  - Actualizar datos de una mesa (solo roles autorizados)
 *   DELETE /tables/:id  - Eliminar una mesa (solo roles autorizados)
 *
 * Control de acceso:
 *   - Listar y ver mesas: cualquier usuario autenticado.
 *   - Crear, actualizar y eliminar: solo SuperAdmin, BusinessOwner o Manager.
 *
 * Tabla(s) relacionada(s): Table
 * Módulo: Mesas (tables)
 * ============================================================
 */

import type { FastifyInstance } from 'fastify';
import { TableService } from './table.service';
import { JwtUser } from '../auth/auth.types';
import {
  createTableBodySchema,
  tableListResponseSchema,
  tableResponseSchema,
  updateTableBodySchema
} from './table.schema';

/**
 * Verifica si el rol del usuario tiene permisos para gestionar mesas.
 * Solo SuperAdmin, BusinessOwner y Manager pueden crear, editar y eliminar mesas.
 *
 * @param role - Rol del usuario autenticado
 * @returns true si el rol tiene permisos de gestión de mesas
 */
const canManageTables = (role: string) => {
  return ['SuperAdmin', 'BusinessOwner', 'Manager'].includes(role);
};

/**
 * Registra las rutas de gestión de mesas en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación
 */
// Register table management routes for business-scoped tables.
export async function tableRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── GET /tables ───────────────────────────────────────────
  // Lista todas las mesas del negocio del usuario autenticado.
  // Accesible para cualquier usuario autenticado.
  server.get(
    '/tables',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: tableListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return TableService.listTables(user.businessId);
    }
  );

  // ── GET /tables/:id ───────────────────────────────────────
  // Obtiene una mesa específica por su ID.
  // Devuelve 404 si la mesa no existe en el negocio.
  server.get(
    '/tables/:id',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: tableResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const table = await TableService.getTableById(id, user.businessId);
      if (!table) {
        return reply.status(404).send({ message: 'Table not found' });
      }
      return table;
    }
  );

  // ── POST /tables ──────────────────────────────────────────
  // Crea una nueva mesa en el negocio.
  // Requiere rol de SuperAdmin, BusinessOwner o Manager.
  server.post(
    '/tables',
    {
      preValidation: [authenticate],
      schema: {
        body: createTableBodySchema,
        response: {
          200: tableResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      // Verificación de autorización: solo roles con permisos de gestión
      if (!canManageTables(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { name, capacity, linkedTableId, status } = request.body as { name: string; capacity?: number; linkedTableId?: string; status: string };
      const table = await TableService.createTable({
        name,
        capacity,
        linkedTableId,
        status: status as any,
        businessId: user.businessId
      });
      return reply.send(table);
    }
  );

  // ── PATCH /tables/:id ─────────────────────────────────────
  // Actualiza parcialmente los datos de una mesa existente.
  // Requiere rol de SuperAdmin, BusinessOwner o Manager.
  server.patch(
    '/tables/:id',
    {
      preValidation: [authenticate],
      schema: {
        body: updateTableBodySchema,
        response: {
          200: tableResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      // Verificación de autorización: solo roles con permisos de gestión
      if (!canManageTables(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      const data = request.body as { name?: string; capacity?: number; linkedTableId?: string | null; status?: string };
      const updated = await TableService.updateTable(id, user.businessId, {
        name: data.name,
        capacity: data.capacity,
        linkedTableId: data.linkedTableId,
        status: data.status as any
      });
      return reply.send(updated);
    }
  );

  // ── DELETE /tables/:id ────────────────────────────────────
  // Elimina una mesa de forma permanente.
  // Requiere rol de SuperAdmin, BusinessOwner o Manager.
  server.delete(
    '/tables/:id',
    {
      preValidation: [authenticate]
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      // Verificación de autorización: solo roles con permisos de gestión
      if (!canManageTables(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      await TableService.deleteTable(id, user.businessId);
      return reply.send({ success: true });
    }
  );
}
