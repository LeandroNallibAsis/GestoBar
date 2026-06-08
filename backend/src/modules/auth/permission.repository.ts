import { prisma } from '../../prisma';
import type { UserRole } from '@prisma/client';

// Repository layer responsible for permission persistence and lookup.
export const permissionRepository = {
  getAllPermissions: async () => {
    return prisma.permission.findMany();
  },

  findPermissionByKey: async (key: string) => {
    return prisma.permission.findUnique({ where: { key } });
  },

  createPermission: async (key: string, description?: string) => {
    return prisma.permission.create({
      data: {
        key,
        description
      }
    });
  },

  getPermissionsForRole: async (role: UserRole, businessId: string) => {
    const mappings = await prisma.rolePermission.findMany({
      where: {
        role,
        businessId
      },
      include: {
        permission: true
      }
    });

    return mappings.map((mapping) => mapping.permission);
  },

  assignPermissionsToRole: async (role: UserRole, businessId: string, permissionKeys: string[]) => {
    const permissions = await prisma.permission.findMany({
      where: {
        key: {
          in: permissionKeys
        }
      }
    });

    await prisma.rolePermission.deleteMany({
      where: {
        role,
        businessId
      }
    });

    return prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        role,
        businessId,
        permissionId: permission.id
      }))
    });
  }
};
