import type { FastifyInstance } from 'fastify';
import { CategoryService } from './category.service';
import { JwtUser } from '../auth/auth.types';
import {
  createCategoryBodySchema,
  categoryListResponseSchema,
  categoryResponseSchema,
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
        response: {
          200: categoryListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return CategoryService.listCategories(user.businessId);
    }
  );

  server.get(
    '/categories/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: categoryParamsSchema,
        response: {
          200: categoryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const category = await CategoryService.getCategoryById(id, user.businessId);
      if (!category) {
        return reply.status(404).send({ message: 'Category not found' });
      }
      return category;
    }
  );

  server.post(
    '/categories',
    {
      preValidation: [authenticate],
      schema: {
        body: createCategoryBodySchema,
        response: {
          201: categoryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { name } = request.body as { name: string };

      const category = await CategoryService.createCategory({
        name,
        businessId: user.businessId
      });

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
        response: {
          200: categoryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const { name } = request.body as { name?: string };

      const updated = await CategoryService.updateCategory(id, user.businessId, { name });

      return reply.send(updated);
    }
  );

  server.post(
    '/categories/:id/deactivate',
    {
      preValidation: [authenticate],
      schema: {
        params: categoryParamsSchema,
        response: {
          200: categoryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const deactivated = await CategoryService.deactivateCategory(id, user.businessId);
      return reply.send(deactivated);
    }
  );

  server.delete(
    '/categories/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: categoryParamsSchema
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      await CategoryService.deactivateCategory(id, user.businessId);
      return reply.send({ success: true });
    }
  );
}
