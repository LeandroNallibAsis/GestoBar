/**
 * ============================================================
 * permission.service.ts
 * ============================================================
 * Servicio de gestión de permisos del sistema GestoBar.
 * Contiene la lógica de negocio para crear, listar y asignar
 * permisos a roles de usuario dentro de un negocio.
 *
 * Los permisos se identifican por una clave única (key) y se
 * asignan a roles (UserRole) con alcance por negocio (businessId).
 *
 * Tabla(s) relacionada(s): Permission, RolePermission
 * Módulo: Autenticación (auth)
 * ============================================================
 */

import { permissionRepository } from './permission.repository';
import type { UserRole } from '@prisma/client';

/**
 * Servicio estático de permisos.
 * Orquesta las operaciones de permisos delegando el acceso
 * a datos al repositorio correspondiente.
 */
// Service layer for permission business logic.
export class PermissionService {
  /**
   * Lista todos los permisos disponibles en el sistema.
   *
   * @returns Array con todos los permisos registrados
   */
  static async listAllPermissions() {
    return permissionRepository.getAllPermissions();
  }

  /**
   * Crea un nuevo permiso en el sistema.
   * Valida que la clave del permiso no exista previamente.
   *
   * @param key - Clave única que identifica al permiso (ej: "orders.create")
   * @param description - Descripción opcional del permiso
   * @returns El permiso recién creado
   * @throws Error si la clave del permiso ya existe
   */
  static async createPermission(key: string, description?: string) {
    // Verifica que no exista un permiso con la misma clave
    const existing = await permissionRepository.findPermissionByKey(key);
    if (existing) {
      throw new Error('Permission key already exists');
    }

    return permissionRepository.createPermission(key, description);
  }

  /**
   * Obtiene los permisos asignados a un rol específico dentro de un negocio.
   *
   * @param role - Rol del usuario (ej: Manager, Waiter, etc.)
   * @param businessId - ID del negocio al que pertenece el rol
   * @returns Array de permisos asignados al rol
   */
  static async getPermissionsForRole(role: UserRole, businessId: string) {
    return permissionRepository.getPermissionsForRole(role, businessId);
  }

  /**
   * Asigna un conjunto de permisos a un rol dentro de un negocio.
   * Reemplaza los permisos existentes del rol con los nuevos especificados.
   *
   * @param role - Rol al que se asignarán los permisos
   * @param businessId - ID del negocio
   * @param permissionKeys - Array de claves de permisos a asignar
   * @returns Resultado de la operación de asignación
   */
  static async assignPermissionsToRole(role: UserRole, businessId: string, permissionKeys: string[]) {
    return permissionRepository.assignPermissionsToRole(role, businessId, permissionKeys);
  }
}
