import { MenuItemRepository } from './menu-item.repository';

// Service layer for MenuItem business logic.
export class MenuItemService {
  static async listMenuItems(businessId: string) {
    return MenuItemRepository.listByBusiness(businessId);
  }

  static async getMenuItemById(id: string, businessId: string) {
    return MenuItemRepository.findById(id, businessId);
  }

  static async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    businessId: string;
  }) {
    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    return MenuItemRepository.createMenuItem(data);
  }

  static async updateMenuItem(
    id: string,
    businessId: string,
    data: { name?: string; description?: string; price?: number; categoryId?: string; isActive?: boolean }
  ) {
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    return MenuItemRepository.updateMenuItem(id, businessId, data);
  }
}
