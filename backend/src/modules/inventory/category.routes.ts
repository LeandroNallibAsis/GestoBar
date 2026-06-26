/**
 * ============================================================
 * category.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) para la gestión de categorías
 * de inventario del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   GET    /categories      - Listar todas las categorías del negocio
 *   POST   /categories      - Crear una nueva categoría
 *   PATCH  /categories/:id  - Actualizar una categoría existente
 *   DELETE /categories/:id  - Eliminar una categoría
 *
 * Todos los endpoints requieren autenticación JWT y operan
 * dentro del alcance del negocio del usuario autenticado.
 *
 * Tabla(s) relacionada(s): Category
 * Módulo: Inventario (inventory)
 * ============================================================
 */

import type { FastifyInstance } from 'fastify';
import { CategoryService } from './category.service';
import { JwtUser } from '../auth/auth.types';
import {
  categoryListResponseSchema,
  categoryResponseSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
  categoryParamsSchema
} from './category.schema';

/**
 * Registra las rutas de gestión de categorías en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación
 */
export async function categoryRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── GET /categories ───────────────────────────────────────
  // Lista todas las categorías del negocio del usuario autenticado.
  server.get(
    '/categories',
    {
      preValidation: [authenticate],
      schema: {
        response: { 200: categoryListResponseSchema }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return CategoryService.list(user.businessId);
    }
  );

  // ── POST /categories ──────────────────────────────────────
  // Crea una nueva categoría en el negocio.
  // Requiere el nombre de la categoría en el body.
  server.post(
    '/categories',
    {
      preValidation: [authenticate],
      schema: {
        body: createCategoryBodySchema,
        response: { 201: categoryResponseSchema }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { name } = request.body as { name: string };
      const category = await CategoryService.create(name, user.businessId);
      return reply.status(201).send(category);
    }
  );

  // ── PATCH /categories/:id ─────────────────────────────────
  // Actualiza parcialmente una categoría existente.
  // Permite modificar el nombre y/o el estado activo.
  server.patch(
    '/categories/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: categoryParamsSchema,
        body: updateCategoryBodySchema,
        response: { 200: categoryResponseSchema }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const data = request.body as { name?: string; isActive?: boolean };
      return CategoryService.update(id, user.businessId, data);
    }
  );

  // ── DELETE /categories/:id ────────────────────────────────
  // Elimina una categoría de forma permanente.
  server.delete(
    '/categories/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: categoryParamsSchema,
        response: { 200: { type: 'object', properties: { success: { type: 'boolean' } } } }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      return CategoryService.delete(id, user.businessId);
    }
  );
}