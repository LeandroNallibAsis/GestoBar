import type { Table, TableStatus } from '@prisma/client';
import { tableRepository } from './table.repository';

// Service layer for table business logic.
// This module encapsulates validation and table state management.
export class TableService {
  static async listTables(businessId: string): Promise<Table[]> {
    return tableRepository.listByBusiness(businessId);
  }

  static async getTableById(id: string, businessId: string): Promise<Table | null> {
    return tableRepository.findById(id, businessId);
  }

  static async createTable(data: {
    name: string;
    capacity?: number;
    status?: TableStatus;
    linkedTableId?: string;
    businessId: string;
  }): Promise<Table> {
    return tableRepository.createTable(data);
  }

  static async updateTable(id: string, businessId: string, data: {
    name?: string;
    capacity?: number;
    status?: TableStatus;
    linkedTableId?: string | null;
  }): Promise<Table> {
    return tableRepository.updateTable(id, businessId, data);
  }

  static async deleteTable(id: string, businessId: string): Promise<void> {
    return tableRepository.deleteTable(id, businessId);
  }
}
