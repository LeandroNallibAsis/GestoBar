/**
 * ============================================================
 * inventory-item.service.ts
 * ============================================================
 * Servicio de gestión de ítems de inventario del sistema GestoBar.
 * Contiene la lógica de negocio para crear, listar y actualizar
 * los insumos/materias primas utilizados en el negocio.
 *
 * Reglas de negocio:
 *   - El costo no puede ser negativo.
 *   - El stock no puede ser negativo.
 *   - Los ítems pueden asociarse opcionalmente a una categoría.
 *
 * Tabla(s) relacionada(s): InventoryItem, Category
 * Módulo: Inventario (inventory)
 * ============================================================
 */

import { InventoryItemRepository } from './inventory-item.repository';

/**
 * Servicio estático de gestión de ítems de inventario.
 * Encapsula la validación de datos y delega el acceso a
 * la base de datos al repositorio correspondiente.
 */
// Service layer for InventoryItem business logic.
export class InventoryItemService {
  /**
   * Lista todos los ítems de inventario de un negocio.
   *
   * @param businessId - ID del negocio
   * @returns Array con todos los ítems de inventario
   */
  static async listInventoryItems(businessId: string) {
    return InventoryItemRepository.listByBusiness(businessId);
  }

  /**
   * Obtiene un ítem de inventario específico por su ID.
   *
   * @param id - ID del ítem de inventario
   * @param businessId - ID del negocio
   * @returns El ítem encontrado o null si no existe
   */
  static async getInventoryItemById(id: string, businessId: string) {
    return InventoryItemRepository.findById(id, businessId);
  }

  /**
   * Crea un nuevo ítem de inventario.
   * Valida que el costo y el stock no sean negativos.
   *
   * @param data - Datos del ítem a crear
   * @param data.name - Nombre del insumo
   * @param data.unit - Unidad de medida (ej: "kg", "litros", "unidad") (opcional)
   * @param data.cost - Costo unitario del insumo (debe ser >= 0)
   * @param data.stock - Cantidad en stock actual (opcional, debe ser >= 0)
   * @param data.categoryId - ID de la categoría a la que pertenece (opcional)
   * @param data.businessId - ID del negocio
   * @returns El ítem de inventario creado
   * @throws Error si el costo o stock son negativos
   */
  static async createInventoryItem(data: {
    name: string;
    unit?: string;
    cost: number;
    stock?: number;
    categoryId?: string;
    businessId: string;
  }) {
    // Validación: el costo no puede ser negativo
    if (data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    // Validación: el stock no puede ser negativo si se proporciona
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return InventoryItemRepository.createInventoryItem(data);
  }

  /**
   * Actualiza un ítem de inventario existente.
   * Valida que el costo y stock actualizados no sean negativos.
   *
   * @param id - ID del ítem a actualizar
   * @param businessId - ID del negocio
   * @param data - Datos parciales a actualizar
   * @param data.name - Nuevo nombre (opcional)
   * @param data.unit - Nueva unidad de medida (opcional)
   * @param data.cost - Nuevo costo unitario (opcional, debe ser >= 0)
   * @param data.stock - Nuevo stock (opcional, debe ser >= 0)
   * @param data.categoryId - Nueva categoría (opcional)
   * @param data.isActive - Nuevo estado activo/inactivo (opcional)
   * @returns El ítem de inventario actualizado
   * @throws Error si el costo o stock proporcionados son negativos
   */
  static async updateInventoryItem(
    id: string,
    businessId: string,
    data: { name?: string; unit?: string; cost?: number; stock?: number; categoryId?: string; isActive?: boolean }
  ) {
    // Validación: el costo no puede ser negativo si se proporciona
    if (data.cost !== undefined && data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    // Validación: el stock no puede ser negativo si se proporciona
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return InventoryItemRepository.updateInventoryItem(id, businessId, data);
  }
}
