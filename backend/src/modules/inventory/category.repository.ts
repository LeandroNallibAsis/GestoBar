/**
 * ============================================================
 * CATEGORY.REPOSITORY.TS
 * ============================================================
 * Capa de acceso a datos para el módulo de categorías.
 * Gestiona las operaciones CRUD de categorías que agrupan
 * productos del menú e insumos del inventario.
 *
 * Las categorías usan eliminación lógica (soft delete):
 * en lugar de borrar el registro, se marca isActive=false.
 * Esto preserva la integridad referencial con productos existentes.
 *
 * Tabla(s) relacionada(s): Category
 * Módulo: Inventario / Categorías
 * ============================================================
 */

import { prisma } from '../../prisma';

export const categoryRepository = {
  /**
   * Lista todas las categorías activas de un negocio, ordenadas alfabéticamente.
   * Solo retorna categorías con isActive=true (las eliminadas no se muestran).
   *
   * @param businessId - ID del negocio (filtro multi-tenancy)
   * @returns Array de categorías activas ordenadas por nombre
   */
  listByBusiness: async (businessId: string) => {
    return prisma.category.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Busca una categoría específica por ID dentro de un negocio.
   * No filtra por isActive, ya que puede necesitarse para consultas internas.
   *
   * @param id - UUID de la categoría
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @returns La categoría encontrada o null si no existe
   */
  findById: async (id: string, businessId: string) => {
    return prisma.category.findFirst({
      where: { id, businessId }
    });
  },

  /**
   * Crea una nueva categoría para un negocio.
   * Se crea con isActive=true por defecto.
   *
   * @param data - Datos de la categoría
   * @param data.name - Nombre de la categoría
   * @param data.businessId - ID del negocio
   * @returns La categoría recién creada
   */
  create: async (data: { name: string; businessId: string }) => {
    return prisma.category.create({
      data: {
        name: data.name,
        businessId: data.businessId,
        isActive: true
      }
    });
  },

  /**
   * Actualiza una categoría existente (nombre y/o estado activo).
   * Usa updateMany con filtro de businessId para seguridad multi-tenant.
   *
   * @param id - UUID de la categoría a actualizar
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @param data - Campos a actualizar (nombre y/o isActive)
   * @returns La categoría actualizada
   * @throws Error si la categoría no se encuentra
   */
  update: async (id: string, businessId: string, data: { name?: string; isActive?: boolean }) => {
    const result = await prisma.category.updateMany({
      where: { id, businessId },
      data
    });

    if (result.count === 0) throw new Error('Category not found');

    // Recupera la categoría actualizada para retornarla
    return prisma.category.findUnique({
      where: { id }
    });
  },

  /**
   * Elimina lógicamente una categoría (soft delete).
   * En lugar de borrar el registro, marca isActive=false.
   * Esto preserva las referencias de productos que usan esta categoría.
   *
   * @param id - UUID de la categoría a desactivar
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @returns Objeto con { success: true }
   * @throws Error si la categoría no se encuentra
   */
  delete: async (id: string, businessId: string) => {
    const result = await prisma.category.updateMany({
      where: { id, businessId },
      data: { isActive: false } // Soft delete: marca como inactiva
    });

    if (result.count === 0) throw new Error('Category not found');

    return { success: true };
  }
};