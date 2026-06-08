import type { Prisma } from '@prisma/client';
import { salonRepository } from './salon.repository';

// Service layer for salon layout business logic.
export class SalonService {
  static async getLayout(businessId: string) {
    return salonRepository.getLayoutByBusiness(businessId);
  }

  static async saveLayout(
    businessId: string,
    rows: number,
    columns: number,
    areas: Array<{ name: string; color: string; cells: Prisma.JsonArray }>
  ) {
    return salonRepository.upsertLayout(businessId, rows, columns, areas);
  }
}
