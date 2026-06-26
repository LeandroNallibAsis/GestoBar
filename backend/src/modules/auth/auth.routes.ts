/**
 * ============================================================
 * auth.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) de autenticación y gestión
 * de permisos del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   POST /auth/login                    - Inicio de sesión con email y contraseña
 *   GET  /auth/permissions/current      - Permisos del usuario autenticado
 *   GET  /auth/permissions              - Listado completo de permisos disponibles
 *   POST /auth/permissions              - Crear un nuevo permiso (solo SuperAdmin)
 *   POST /auth/roles/:role/permissions  - Asignar permisos a un rol
 *
 * Tabla(s) relacionada(s): User, Permission, RolePermission
 * Módulo: Autenticación (auth)
 * ============================================================
 */

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

/**
 * Registra las rutas de autenticación y permisos en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación (authenticate)
 */
// Register authentication and permission routes into the Fastify application.
export async function authRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── POST /auth/login ──────────────────────────────────────
  // Endpoint de inicio de sesión.
  // Recibe email y contraseña, valida las credenciales y
  // devuelve un token JWT junto con los datos básicos del usuario.
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
        // Verifica las credenciales del usuario contra la base de datos
        const user = await AuthService.verifyCredentials(email, password);

        // Genera un token JWT con los datos esenciales del usuario
        const token = server.jwt.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
          businessId: user.businessId
        });

        // Devuelve el token y la información pública del usuario
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
        // Responde con 401 si las credenciales son inválidas
        return reply.status(401).send({ message: 'Invalid email or password' });
      }
    }
  );

  // ── GET /auth/permissions/current ─────────────────────────
  // Obtiene los permisos asociados al rol del usuario autenticado.
  // Requiere autenticación JWT.
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
      // Consulta los permisos según el rol y el negocio del usuario
      return PermissionService.getPermissionsForRole(user.role as any, user.businessId);
    }
  );

  // ── GET /auth/permissions ─────────────────────────────────
  // Lista todos los permisos disponibles en el sistema.
  // Requiere autenticación JWT.
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

  // ── POST /auth/permissions ────────────────────────────────
  // Crea un nuevo permiso en el sistema.
  // Solo accesible para usuarios con rol SuperAdmin.
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
      // Verificación de autorización: solo SuperAdmin puede crear permisos
      if (user.role !== 'SuperAdmin') {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { key, description } = request.body as { key: string; description?: string };
      const permission = await PermissionService.createPermission(key, description);
      return reply.send(permission);
    }
  );

  // ── POST /auth/roles/:role/permissions ────────────────────
  // Asigna un conjunto de permisos a un rol específico dentro de un negocio.
  // Solo accesible para SuperAdmin y BusinessOwner.
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
      // Solo SuperAdmin y BusinessOwner pueden asignar permisos a roles
      if (user.role !== 'SuperAdmin' && user.role !== 'BusinessOwner') {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { role } = request.params as { role: string };
      const { permissionKeys } = request.body as { permissionKeys: string[] };

      // Asigna los permisos especificados al rol dentro del negocio del usuario
      await PermissionService.assignPermissionsToRole(role as any, user.businessId, permissionKeys);
      return reply.send({ success: true });
    }
  );
}
