/**
 * ============================================================
 * PERMISSION.REPOSITORY.TS
 * ============================================================
 * Capa de acceso a datos para la gestión de permisos del sistema.
 * Maneja las operaciones CRUD de permisos y la asignación de
 * permisos a roles dentro de un negocio específico.
 *
 * El sistema de permisos funciona en dos niveles:
 * 1. Permisos por rol (RolePermission): Todos los usuarios con
 *    un rol heredan los mismos permisos.
 * 2. Permisos por usuario (UserPermission): Permisos individuales
 *    para casos especiales (manejado en user-permission.repository).
 *
 * Tabla(s) relacionada(s): Permission, RolePermission
 * Módulo: Autenticación / Permisos
 * ============================================================
 */

import { prisma } from '../../prisma';
import type { UserRole } from '@prisma/client';

// Repository layer responsible for permission persistence and lookup.
export const permissionRepository = {
  /**
   * Obtiene todos los permisos definidos en el sistema.
   * Retorna la lista completa sin filtrar por negocio,
   * ya que los permisos son globales (las asignaciones son por negocio).
   *
   * @returns Array con todos los permisos del sistema
   */
  getAllPermissions: async () => {
    return prisma.permission.findMany();
  },

  /**
   * Busca un permiso por su clave única.
   * Las claves siguen el formato 'modulo:accion' (ej: 'orders:create').
   *
   * @param key - Clave única del permiso
   * @returns El permiso encontrado o null si no existe
   */
  findPermissionByKey: async (key: string) => {
    return prisma.permission.findUnique({ where: { key } });
  },

  /**
   * Crea un nuevo permiso en el sistema.
   *
   * @param key - Clave única del permiso (ej: 'reports:export')
   * @param description - Descripción legible opcional
   * @returns El permiso recién creado
   */
  createPermission: async (key: string, description?: string) => {
    return prisma.permission.create({
      data: {
        key,
        description
      }
    });
  },

  /**
   * Obtiene los permisos asignados a un rol específico dentro de un negocio.
   * Incluye los datos del permiso (key, description) mediante join.
   * Retorna solo los objetos Permission (sin la tabla intermedia).
   *
   * @param role - Rol del usuario (SuperAdmin, BusinessOwner, Employee)
   * @param businessId - ID del negocio (multi-tenancy)
   * @returns Array de permisos asignados al rol en ese negocio
   */
  getPermissionsForRole: async (role: UserRole, businessId: string) => {
    const mappings = await prisma.rolePermission.findMany({
      where: {
        role,
        businessId
      },
      include: {
        permission: true // Incluye los datos completos del permiso (join)
      }
    });

    // Extrae solo los objetos Permission de las relaciones intermedias
    return mappings.map((mapping) => mapping.permission);
  },

  /**
   * Asigna un conjunto de permisos a un rol dentro de un negocio.
   * Usa estrategia de REEMPLAZO TOTAL: primero elimina todos los
   * permisos existentes del rol en ese negocio y luego crea los nuevos.
   *
   * Esto garantiza que el estado final sea exactamente lo que se envía,
   * sin permisos huérfanos de asignaciones anteriores.
   *
   * @param role - Rol al que se asignan los permisos
   * @param businessId - ID del negocio
   * @param permissionKeys - Array de claves de permisos a asignar
   * @returns Resultado de la creación masiva (count de registros creados)
   */
  assignPermissionsToRole: async (role: UserRole, businessId: string, permissionKeys: string[]) => {
    // Busca los permisos por sus claves para obtener los IDs
    const permissions = await prisma.permission.findMany({
      where: {
        key: {
          in: permissionKeys
        }
      }
    });

    // Elimina todas las asignaciones existentes del rol en este negocio
    await prisma.rolePermission.deleteMany({
      where: {
        role,
        businessId
      }
    });

    // Crea las nuevas asignaciones rol-permiso
    return prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        role,
        businessId,
        permissionId: permission.id
      }))
    });
  }
};
