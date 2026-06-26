/**
 * ============================================================
 * AUTH.REPOSITORY.TS
 * ============================================================
 * Capa de acceso a datos para el módulo de autenticación.
 * Contiene las consultas a la base de datos relacionadas con
 * la búsqueda y creación de usuarios durante el proceso de
 * login y registro.
 *
 * Tabla(s) relacionada(s): User
 * Módulo: Autenticación (Auth)
 * ============================================================
 */

import { prisma } from '../../prisma';
import type { User, UserRole } from '@prisma/client';

// Repository responsible for user persistence and retrieval.
// All database queries are isolated here to keep service logic clean.
export const authRepository = {
  /**
   * Busca un usuario activo por su dirección de email.
   * Solo retorna usuarios con isActive=true para evitar
   * que usuarios desactivados puedan iniciar sesión.
   *
   * @param email - Dirección de email del usuario
   * @returns El usuario encontrado o null si no existe/está inactivo
   */
  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findFirst({ where: { email, isActive: true } });
  },

  /**
   * Busca un usuario por su ID único (UUID).
   * No filtra por isActive, ya que se usa internamente
   * para verificar tokens JWT existentes.
   *
   * @param id - UUID del usuario
   * @returns El usuario encontrado o null si no existe
   */
  findById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { id } });
  },

  /**
   * Crea un nuevo usuario en la base de datos.
   * Si no se proporciona nombre, se genera automáticamente
   * a partir de la parte local del email (antes del @).
   *
   * @param data - Datos del usuario a crear
   * @param data.email - Email único del usuario
   * @param data.name - Nombre (opcional, se genera desde el email si no se provee)
   * @param data.password - Contraseña ya hasheada con bcrypt
   * @param data.role - Rol del usuario (SuperAdmin, BusinessOwner, Employee)
   * @param data.businessId - ID del negocio al que pertenece
   * @returns El usuario creado con todos sus campos
   */
  createUser: async (data: {
    email: string;
    name?: string;
    password: string;
    role: UserRole;
    businessId: string;
  }): Promise<User> => {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name ?? data.email.split('@')[0], // Genera nombre desde el email si no se provee
        password: data.password,
        role: data.role,
        businessId: data.businessId
      }
    });
  }
};
