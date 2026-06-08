import { permissionRepository } from './permission.repository';
import type { UserRole } from '@prisma/client';

// Service layer for permission business logic.
export class PermissionService {
  static async listAllPermissions() {
    return permissionRepository.getAllPermissions();
  }

  static async createPermission(key: string, description?: string) {
    const existing = await permissionRepository.findPermissionByKey(key);
    if (existing) {
      throw new Error('Permission key already exists');
    }

    return permissionRepository.createPermission(key, description);
  }

  static async getPermissionsForRole(role: UserRole, businessId: string) {
    return permissionRepository.getPermissionsForRole(role, businessId);
  }

  static async assignPermissionsToRole(role: UserRole, businessId: string, permissionKeys: string[]) {
    return permissionRepository.assignPermissionsToRole(role, businessId, permissionKeys);
  }
}
