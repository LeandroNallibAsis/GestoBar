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

export async function categoryRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

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