/**
 * ============================================================
 * TABLE.REPOSITORY.TS
 * ============================================================
 * Capa de acceso a datos para el módulo de mesas.
 * Gestiona las operaciones CRUD de las mesas físicas del
 * establecimiento y sus estados (FREE, OCCUPIED, etc.).
 *
 * Las mesas pueden vincularse entre sí (linkedTableId) para
 * representar mesas unidas cuando hay grupos grandes.
 *
 * Tabla(s) relacionada(s): Table
 * Módulo: Mesas (Tables)
 * ============================================================
 */

import { prisma } from '../../prisma';
import type { Table, TableStatus } from '@prisma/client';

// Repository layer for table persistence and queries.
// All database access for tables is isolated here.
export const tableRepository = {
  /**
   * Lista todas las mesas de un negocio, ordenadas por fecha de creación.
   * El orden ascendente permite que las mesas aparezcan en el orden
   * en que fueron creadas (Mesa 1, Mesa 2, etc.).
   *
   * @param businessId - ID del negocio (filtro multi-tenancy)
   * @returns Array de mesas del negocio
   */
  listByBusiness: async (businessId: string): Promise<Table[]> => {
    return prisma.table.findMany({
      where: { businessId },
      orderBy: { createdAt: 'asc' }
    });
  },

  /**
   * Busca una mesa específica por ID dentro de un negocio.
   * Usa findFirst con filtro de businessId para aislamiento multi-tenant.
   *
   * @param id - UUID de la mesa
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @returns La mesa encontrada o null si no existe
   */
  findById: async (id: string, businessId: string): Promise<Table | null> => {
    return prisma.table.findFirst({ where: { id, businessId } });
  },

  /**
   * Crea una nueva mesa en el establecimiento.
   * Si no se proporciona estado, se asigna 'FREE' por defecto.
   * Opcionalmente puede vincularse a otra mesa existente.
   *
   * @param data - Datos de la mesa a crear
   * @param data.name - Nombre o número de la mesa (ej: "Mesa 5")
   * @param data.capacity - Capacidad de personas (opcional)
   * @param data.status - Estado inicial (opcional, default: FREE)
   * @param data.linkedTableId - ID de mesa a vincular (opcional)
   * @param data.businessId - ID del negocio
   * @returns La mesa recién creada
   */
  createTable: async (data: { name: string; capacity?: number; status?: TableStatus; linkedTableId?: string; businessId: string }): Promise<Table> => {
    return prisma.table.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        status: data.status || 'FREE', // Estado por defecto: disponible
        linkedTableId: data.linkedTableId,
        businessId: data.businessId
      }
    });
  },

  /**
   * Actualiza los datos de una mesa existente.
   * Usa updateMany con filtro de businessId para seguridad multi-tenant.
   * Luego recupera la mesa actualizada para retornarla completa.
   *
   * @param id - UUID de la mesa a actualizar
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @param data - Campos a actualizar (nombre, capacidad, estado, vinculación)
   * @returns La mesa actualizada
   * @throws Error si la mesa no se encuentra
   */
  updateTable: async (id: string, businessId: string, data: { name?: string; capacity?: number; status?: TableStatus; linkedTableId?: string | null }): Promise<Table> => {
    const result = await prisma.table.updateMany({
      where: { id, businessId },
      data
    });

    // Verifica que se encontró y actualizó la mesa
    if (result.count === 0) {
      throw new Error('Table not found');
    }

    // Recupera la mesa actualizada para retornar los datos completos
    const updated = await prisma.table.findUnique({ where: { id } });
    if (!updated) {
      throw new Error('Table not found after update');
    }

    return updated;
  },

  /**
   * Elimina una mesa por ID dentro de un negocio.
   * Usa deleteMany con filtro de businessId para seguridad multi-tenant.
   *
   * @param id - UUID de la mesa a eliminar
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @throws Error si la mesa no se encuentra
   */
  deleteTable: async (id: string, businessId: string): Promise<void> => {
    const result = await prisma.table.deleteMany({ where: { id, businessId } });
    if (result.count === 0) {
      throw new Error('Table not found');
    }
  }
};
