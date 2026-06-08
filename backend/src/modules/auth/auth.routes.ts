import type { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { JwtUser } from './auth.types';
import {
  assignPermissionsBodySchema,
  assignPermissionsParamsSchema,
  createPermissionBodySchema,
  loginBodySchema,
  loginResponseSchema,
  permissionListResponseSchema,
  permissionResponseSchema
} from './auth.schema';

// Register authentication and permission routes into the Fastify application.
export async function authRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.post(
    '/auth/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: loginResponseSchema
        }
      }
    },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };

      try {
        const user = await AuthService.verifyCredentials(email, password);

        const token = server.jwt.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
          businessId: user.businessId
        });

        return reply.send({
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            businessId: user.businessId
          }
        });
      } catch (error) {
        return reply.status(401).send({ message: 'Invalid email or password' });
      }
    }
  );

  server.get(
    '/auth/permissions/current',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: permissionListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return PermissionService.getPermissionsForRole(user.role as any, user.businessId);
    }
  );

  server.get(
    '/auth/permissions',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: permissionListResponseSchema
        }
      }
    },
    async () => {
      return PermissionService.listAllPermissions();
    }
  );

  server.post(
    '/auth/permissions',
    {
      preValidation: [authenticate],
      schema: {
        body: createPermissionBodySchema,
        response: {
          200: permissionResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (user.role !== 'SuperAdmin') {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { key, description } = request.body as { key: string; description?: string };
      const permission = await PermissionService.createPermission(key, description);
      return reply.send(permission);
    }
  );

  server.post(
    '/auth/roles/:role/permissions',
    {
      preValidation: [authenticate],
      schema: {
        params: assignPermissionsParamsSchema,
        body: assignPermissionsBodySchema
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (user.role !== 'SuperAdmin' && user.role !== 'BusinessOwner') {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { role } = request.params as { role: string };
      const { permissionKeys } = request.body as { permissionKeys: string[] };

      await PermissionService.assignPermissionsToRole(role as any, user.businessId, permissionKeys);
      return reply.send({ success: true });
    }
  );
}
