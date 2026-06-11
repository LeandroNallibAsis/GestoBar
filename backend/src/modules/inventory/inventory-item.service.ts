import { InventoryItemRepository } from './inventory-item.repository';

// Service layer for InventoryItem business logic.
export class InventoryItemService {
  static async listInventoryItems(businessId: string) {
    return InventoryItemRepository.listByBusiness(businessId);
  }

  static async getInventoryItemById(id: string, businessId: string) {
    return InventoryItemRepository.findById(id, businessId);
  }

  static async createInventoryItem(data: {
    name: string;
    unit?: string;
    cost: number;
    stock?: number;
    categoryId?: string;
    businessId: string;
  }) {
    if (data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return InventoryItemRepository.createInventoryItem(data);
  }

  static async updateInventoryItem(
    id: string,
    businessId: string,
    data: { name?: string; unit?: string; cost?: number; stock?: number; categoryId?: string; isActive?: boolean }
  ) {
    if (data.cost !== undefined && data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return InventoryItemRepository.updateInventoryItem(id, businessId, data);
  }
}
