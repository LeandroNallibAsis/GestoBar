/**
 * ============================================================
 * menu-item.service.ts
 * ============================================================
 * Servicio de gestión de ítems del menú del sistema GestoBar.
 * Contiene la lógica de negocio para crear, listar y actualizar
 * los productos que se ofrecen a los clientes en el menú.
 *
 * A diferencia de InventoryItem (insumos/materias primas), los
 * MenuItem representan los productos finales que el cliente puede
 * ordenar (platos, bebidas, postres, etc.).
 *
 * Reglas de negocio:
 *   - El precio debe ser estrictamente mayor a 0.
 *   - Los ítems pueden asociarse opcionalmente a una categoría.
 *
 * Tabla(s) relacionada(s): MenuItem, Category
 * Módulo: Inventario (inventory)
 * ============================================================
 */

import { MenuItemRepository } from './menu-item.repository';

/**
 * Servicio estático de gestión de ítems del menú.
 * Encapsula la validación de precios y delega el acceso
 * a la base de datos al repositorio correspondiente.
 */
// Service layer for MenuItem business logic.
export class MenuItemService {
  /**
   * Lista todos los ítems del menú de un negocio.
   *
   * @param businessId - ID del negocio
   * @returns Array con todos los ítems del menú
   */
  static async listMenuItems(businessId: string) {
    return MenuItemRepository.listByBusiness(businessId);
  }

  /**
   * Obtiene un ítem del menú específico por su ID.
   *
   * @param id - ID del ítem del menú
   * @param businessId - ID del negocio
   * @returns El ítem encontrado o null si no existe
   */
  static async getMenuItemById(id: string, businessId: string) {
    return MenuItemRepository.findById(id, businessId);
  }

  /**
   * Crea un nuevo ítem del menú.
   * Valida que el precio sea mayor a 0.
   *
   * @param data - Datos del ítem a crear
   * @param data.name - Nombre del producto (ej: "Hamburguesa clásica")
   * @param data.description - Descripción del producto (opcional)
   * @param data.price - Precio de venta al público (debe ser > 0)
   * @param data.categoryId - ID de la categoría a la que pertenece (opcional)
   * @param data.businessId - ID del negocio
   * @returns El ítem del menú creado
   * @throws Error si el precio es menor o igual a 0
   */
  static async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    businessId: string;
  }) {
    // Validación: el precio debe ser mayor a cero
    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    return MenuItemRepository.createMenuItem(data);
  }

  /**
   * Actualiza un ítem del menú existente.
   * Valida que el precio actualizado sea mayor a 0 si se proporciona.
   *
   * @param id - ID del ítem a actualizar
   * @param businessId - ID del negocio
   * @param data - Datos parciales a actualizar
   * @param data.name - Nuevo nombre (opcional)
   * @param data.description - Nueva descripción (opcional)
   * @param data.price - Nuevo precio (opcional, debe ser > 0)
   * @param data.categoryId - Nueva categoría (opcional)
   * @param data.isActive - Nuevo estado activo/inactivo (opcional)
   * @returns El ítem del menú actualizado
   * @throws Error si el precio proporcionado es menor o igual a 0
   */
  static async updateMenuItem(
    id: string,
    businessId: string,
    data: { name?: string; description?: string; price?: number; categoryId?: string; isActive?: boolean }
  ) {
    // Validación: el precio debe ser mayor a cero si se proporciona
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    return MenuItemRepository.updateMenuItem(id, businessId, data);
  }
}
