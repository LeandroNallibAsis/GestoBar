/**
 * ============================================================
 * user-permission.routes.ts
 * ============================================================
 * Definición de las rutas (endpoints) de la API REST.
 * Módulo: Backend / users
 * ============================================================
 */
import type { FastifyInstance } from 'fastify';
import { JwtUser } from '../auth/auth.types';
import { userPermissionRepository } from './user-permission.repository';
import { permissionRepository } from '../auth/permission.repository';

// Routes for managing per-user permissions.
// Only BusinessOwner and SuperAdmin can modify employee permissions.
export async function userPermissionRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // Get all available permissions (keys) for the checkbox list in UI.
  server.get(
    '/permissions',
    { preValidation: [authenticate] },
    async () => {
      return permissionRepository.getAllPermissions();
    }
  );

  // Get the permissions assigned to a specific user.
  server.get(
    '/users/:id/permissions',
    { preValidation: [authenticate] },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const perms = await userPermissionRepository.getUserPermissions(id, user.businessId);
      return reply.send(perms.map((p) => p.permission.key));
    }
  );

  // Set (replace) the permissions for a specific user.
  server.put(
    '/users/:id/permissions',
    { preValidation: [authenticate] },
    async (request, reply) => {
      const user = request.user as JwtUser;
      // Only BusinessOwner and SuperAdmin can manage permissions.
      if (!['SuperAdmin', 'BusinessOwner'].includes(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      const { permissionKeys } = request.body as { permissionKeys: string[] };

      await userPermissionRepository.setUserPermissions(id, user.businessId, permissionKeys);
      return reply.send({ success: true });
    }
  );
}
