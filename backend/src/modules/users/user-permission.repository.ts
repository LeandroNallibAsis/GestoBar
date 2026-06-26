/**
 * ============================================================
 * user-permission.repository.ts
 * ============================================================
 * Repositorio de datos. Encapsula las consultas a la base de datos.
 * Módulo: Backend / users
 * ============================================================
 */
import { prisma } from '../../prisma';

// Repository for managing individual user permissions.
// BusinessOwner can grant or revoke specific permissions per employee.
export const userPermissionRepository = {
  // Get all permissions assigned to a specific user in a business.
  getUserPermissions: async (userId: string, businessId: string) => {
    return prisma.userPermission.findMany({
      where: { userId, businessId },
      include: { permission: true }
    });
  },

  // Replace all permissions for a user with a new set of permission keys.
  setUserPermissions: async (userId: string, businessId: string, permissionKeys: string[]) => {
    // Fetch permissions by their keys
    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } }
    });

    // Delete existing permissions for this user, then create new ones
    await prisma.userPermission.deleteMany({ where: { userId, businessId } });

    if (permissions.length > 0) {
      await prisma.userPermission.createMany({
        data: permissions.map((p) => ({
          userId,
          permissionId: p.id,
          businessId
        })),
        skipDuplicates: true
      });
    }

    return userPermissionRepository.getUserPermissions(userId, businessId);
  }
};
