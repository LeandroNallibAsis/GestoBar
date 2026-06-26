/**
 * ============================================================
 * salon.repository.ts
 * ============================================================
 * Repositorio de datos. Encapsula las consultas a la base de datos.
 * Módulo: Backend / salon
 * ============================================================
 */
import { prisma } from '../../prisma';
import type { SalonLayout } from '@prisma/client';
import type { Prisma } from '@prisma/client';

// Repository layer responsible for salon layout persistence.
export const salonRepository = {
  getLayoutByBusiness: async (businessId: string): Promise<SalonLayout | null> => {
    return prisma.salonLayout.findUnique({
      where: { businessId },
      include: { areas: true }
    });
  },

  upsertLayout: async (
    businessId: string,
    rows: number,
    columns: number,
    areas: Array<{ name: string; color: string; cells: Prisma.JsonArray }>
  ): Promise<SalonLayout> => {
    return prisma.salonLayout.upsert({
      where: { businessId },
      create: {
        businessId,
        rows,
        columns,
        areas: {
          create: areas.map((area) => ({
            name: area.name,
            color: area.color,
            cells: area.cells
          }))
        }
      },
      update: {
        rows,
        columns,
        areas: {
          deleteMany: {},
          create: areas.map((area) => ({
            name: area.name,
            color: area.color,
            cells: area.cells
          }))
        }
      },
      include: { areas: true }
    });
  }
};
