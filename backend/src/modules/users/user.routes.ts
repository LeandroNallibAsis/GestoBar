/**
 * ============================================================
 * user.routes.ts
 * ============================================================
 * Definición de las rutas (endpoints) de la API REST.
 * Módulo: Backend / users
 * ============================================================
 */
import type { FastifyInstance } from 'fastify';
import { UserService } from './user.service';
import { JwtUser } from '../auth/auth.types';
import {
  createUserBodySchema,
  updateUserBodySchema,
  userListResponseSchema,
  userResponseSchema
} from './user.schema';

const canManageUsers = (role: string) => {
  return ['SuperAdmin', 'BusinessOwner', 'Manager'].includes(role);
};

// Register user management routes for business-scoped users.
export async function userRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.get(
    '/users',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: userListResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!canManageUsers(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      return UserService.listUsers(user.businessId);
    }
  );

  server.get(
    '/users/:id',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: userResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!canManageUsers(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      const targetUser = await UserService.getUserById(id, user.businessId);
      if (!targetUser) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return targetUser;
    }
  );

  server.post(
    '/users',
    {
      preValidation: [authenticate],
      schema: {
        body: createUserBodySchema,
        response: {
          200: userResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!['SuperAdmin', 'BusinessOwner'].includes(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { email, name, password, role } = request.body as {
        email: string;
        name?: string;
        password: string;
        role: string;
      };

      const createdUser = await UserService.createUser({
        email,
        name,
        password,
        role: role as any,
        businessId: user.businessId
      });

      return reply.send(createdUser);
    }
  );

  server.patch(
    '/users/:id',
    {
      preValidation: [authenticate],
      schema: {
        body: updateUserBodySchema,
        response: {
          200: userResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!['SuperAdmin', 'BusinessOwner'].includes(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      const updateData = request.body as {
        name?: string;
        password?: string;
        role?: string;
        isActive?: boolean;
      };

      const updatedUser = await UserService.updateUser(id, user.businessId, {
        name: updateData.name,
        role: updateData.role as any,
        password: updateData.password,
        isActive: updateData.isActive
      });

      return reply.send(updatedUser);
    }
  );

  server.patch(
    '/users/:id/deactivate',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: userResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!['SuperAdmin', 'BusinessOwner'].includes(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      const deactivatedUser = await UserService.deactivateUser(id, user.businessId);
      return reply.send(deactivatedUser);
    }
  );
}
