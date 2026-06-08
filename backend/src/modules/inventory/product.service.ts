import { productRepository } from './product.repository';

// Service layer for product business logic.
export class ProductService {
  static async listProducts(businessId: string) {
    return productRepository.listByBusiness(businessId);
  }

  static async getProductById(id: string, businessId: string) {
    return productRepository.findById(id, businessId);
  }

  static async createProduct(data: {
    name: string;
    price: number;
    stock: number;
    categoryId?: string;
    businessId: string;
  }) {
    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return productRepository.createProduct(data);
  }

  static async updateProduct(
    id: string,
    businessId: string,
    data: { name?: string; price?: number; stock?: number; categoryId?: string }
  ) {
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return productRepository.updateProduct(id, businessId, data);
  }

  static async deactivateProduct(id: string, businessId: string) {
    return productRepository.deactivateProduct(id, businessId);
  }

  static async decrementStock(id: string, businessId: string, quantity: number) {
    const product = await productRepository.findById(id, businessId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    return productRepository.decrementStock(id, businessId, quantity);
  }
}
