import type { FastifyInstance } from 'fastify';
import { ProductService } from './product.service';
import { JwtUser } from '../auth/auth.types';
import {
  createProductBodySchema,
  productListResponseSchema,
  productResponseSchema,
  updateProductBodySchema,
  productParamsSchema
} from './product.schema';

export async function productRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.get(
    '/products',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: productListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return ProductService.listProducts(user.businessId);
    }
  );

  server.get(
    '/products/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: productParamsSchema,
        response: {
          200: productResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const product = await ProductService.getProductById(id, user.businessId);
      if (!product) {
        return reply.status(404).send({ message: 'Product not found' });
      }
      return product;
    }
  );

  server.post(
    '/products',
    {
      preValidation: [authenticate],
      schema: {
        body: createProductBodySchema,
        response: {
          201: productResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { name, price, stock, categoryId } = request.body as {
        name: string;
        price: number;
        stock: number;
        categoryId?: string;
      };

      const product = await ProductService.createProduct({
        name,
        price,
        stock,
        categoryId,
        businessId: user.businessId
      });

      return reply.status(201).send(product);
    }
  );

  server.patch(
    '/products/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: productParamsSchema,
        body: updateProductBodySchema,
        response: {
          200: productResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const { name, price, stock, categoryId } = request.body as {
        name?: string;
        price?: number;
        stock?: number;
        categoryId?: string;
      };

      const updated = await ProductService.updateProduct(id, user.businessId, {
        name,
        price,
        stock,
        categoryId
      });

      return reply.send(updated);
    }
  );

  server.post(
    '/products/:id/deactivate',
    {
      preValidation: [authenticate],
      schema: {
        params: productParamsSchema,
        response: {
          200: productResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const deactivated = await ProductService.deactivateProduct(id, user.businessId);
      return reply.send(deactivated);
    }
  );

  server.delete(
    '/products/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: productParamsSchema
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      await ProductService.deactivateProduct(id, user.businessId);
      return reply.send({ success: true });
    }
  );
}
