import { categoryRepository } from './category.repository';

// Service layer for category business logic.
export class CategoryService {
  static async listCategories(businessId: string) {
    return categoryRepository.listByBusiness(businessId);
  }

  static async getCategoryById(id: string, businessId: string) {
    return categoryRepository.findById(id, businessId);
  }

  static async createCategory(data: { name: string; businessId: string }) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Category name is required');
    }

    return categoryRepository.createCategory(data);
  }

  static async updateCategory(id: string, businessId: string, data: { name?: string }) {
    if (data.name !== undefined && (data.name === '' || !data.name.trim())) {
      throw new Error('Category name is required');
    }

    return categoryRepository.updateCategory(id, businessId, data);
  }

  static async deactivateCategory(id: string, businessId: string) {
    return categoryRepository.deactivateCategory(id, businessId);
  }
}
