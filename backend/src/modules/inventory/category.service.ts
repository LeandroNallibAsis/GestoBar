import { categoryRepository } from './category.repository';

export class CategoryService {
  static async list(businessId: string) {
    return categoryRepository.listByBusiness(businessId);
  }

  static async getById(id: string, businessId: string) {
    const category = await categoryRepository.findById(id, businessId);
    if (!category) throw new Error('Category not found');
    return category;
  }

  static async create(name: string, businessId: string) {
    if (!name.trim()) throw new Error('Name is required');
    return categoryRepository.create({ name, businessId });
  }

  static async update(id: string, businessId: string, data: { name?: string; isActive?: boolean }) {
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    return categoryRepository.update(id, businessId, data);
  }

  static async delete(id: string, businessId: string) {
    return categoryRepository.delete(id, businessId);
  }
}