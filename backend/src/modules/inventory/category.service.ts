/**
 * ============================================================
 * category.service.ts
 * ============================================================
 * Servicio de gestión de categorías de inventario del sistema GestoBar.
 * Contiene la lógica de negocio para crear, listar, actualizar
 * y eliminar categorías que agrupan los productos del menú
 * y los ítems de inventario.
 *
 * Reglas de negocio:
 *   - El nombre de la categoría es obligatorio y no puede estar vacío.
 *   - Al actualizar, si se proporciona un nombre, no puede quedar vacío.
 *   - Las categorías se filtran por negocio (businessId).
 *
 * Tabla(s) relacionada(s): Category
 * Módulo: Inventario (inventory)
 * ============================================================
 */

import { categoryRepository } from './category.repository';

/**
 * Servicio estático de gestión de categorías.
 * Orquesta las operaciones CRUD de categorías con
 * validaciones de negocio antes de delegar al repositorio.
 */
export class CategoryService {
  /**
   * Lista todas las categorías de un negocio.
   *
   * @param businessId - ID del negocio
   * @returns Array con todas las categorías del negocio
   */
  static async list(businessId: string) {
    return categoryRepository.listByBusiness(businessId);
  }

  /**
   * Obtiene una categoría por su ID dentro de un negocio.
   *
   * @param id - ID de la categoría
   * @param businessId - ID del negocio
   * @returns La categoría encontrada
   * @throws Error si la categoría no existe
   */
  static async getById(id: string, businessId: string) {
    const category = await categoryRepository.findById(id, businessId);
    // Lanza error si la categoría no fue encontrada
    if (!category) throw new Error('Category not found');
    return category;
  }

  /**
   * Crea una nueva categoría en el negocio.
   * Valida que el nombre no esté vacío.
   *
   * @param name - Nombre de la categoría
   * @param businessId - ID del negocio
   * @returns La categoría recién creada
   * @throws Error si el nombre está vacío
   */
  static async create(name: string, businessId: string) {
    // Validación: el nombre es obligatorio y no puede estar vacío
    if (!name.trim()) throw new Error('Name is required');
    return categoryRepository.create({ name, businessId });
  }

  /**
   * Actualiza los datos de una categoría existente.
   * Permite modificar el nombre y/o el estado activo.
   *
   * @param id - ID de la categoría a actualizar
   * @param businessId - ID del negocio
   * @param data - Datos parciales a actualizar
   * @param data.name - Nuevo nombre (opcional, no puede ser vacío si se proporciona)
   * @param data.isActive - Nuevo estado activo/inactivo (opcional)
   * @returns La categoría actualizada
   * @throws Error si el nombre proporcionado está vacío
   */
  static async update(id: string, businessId: string, data: { name?: string; isActive?: boolean }) {
    // Validación: si se proporciona nombre, no puede quedar vacío
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    return categoryRepository.update(id, businessId, data);
  }

  /**
   * Elimina una categoría de forma permanente.
   *
   * @param id - ID de la categoría a eliminar
   * @param businessId - ID del negocio
   * @returns Resultado de la eliminación
   */
  static async delete(id: string, businessId: string) {
    return categoryRepository.delete(id, businessId);
  }
}