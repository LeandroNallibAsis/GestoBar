/**
 * ============================================================
 * user.service.ts
 * ============================================================
 * Servicio con las reglas de negocio y validaciones principales.
 * Módulo: Backend / users
 * ============================================================
 */
import { AuthService } from '../auth/auth.service';
import { userRepository } from './user.repository';
import type { User, UserRole } from '@prisma/client';

// Service layer for user business logic.
export class UserService {
  static async listUsers(businessId: string): Promise<User[]> {
    return userRepository.listByBusiness(businessId);
  }

  static async getUserById(id: string, businessId: string): Promise<User | null> {
    return userRepository.findById(id, businessId);
  }

  static async createUser(data: {
    email: string;
    name?: string;
    password: string;
    role: UserRole;
    businessId: string;
  }): Promise<User> {
    const hashedPassword = await AuthService.hashPassword(data.password);
    return userRepository.createUser({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      businessId: data.businessId
    });
  }

  static async updateUser(id: string, businessId: string, data: {
    name?: string;
    role?: UserRole;
    password?: string;
    isActive?: boolean;
  }): Promise<User> {
    const updateData: Partial<Omit<User, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.password = await AuthService.hashPassword(data.password);
    }

    return userRepository.updateUser(id, businessId, updateData);
  }

  static async deactivateUser(id: string, businessId: string): Promise<User> {
    return userRepository.updateUser(id, businessId, { isActive: false });
  }
}
