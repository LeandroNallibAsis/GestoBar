/**
 * ============================================================
 * table.service.ts
 * ============================================================
 * Servicio de gestión de mesas del sistema GestoBar.
 * Contiene la lógica de negocio para crear, listar, actualizar
 * y eliminar mesas dentro de un negocio.
 *
 * Las mesas pueden tener diferentes estados (AVAILABLE, OCCUPIED, etc.)
 * y opcionalmente estar vinculadas a otra mesa (linkedTableId)
 * para representar mesas combinadas o agrupadas.
 *
 * Tabla(s) relacionada(s): Table
 * Módulo: Mesas (tables)
 * ============================================================
 */

import type { Table, TableStatus } from '@prisma/client';
import { tableRepository } from './table.repository';

/**
 * Servicio estático de gestión de mesas.
 * Encapsula la validación y gestión del estado de las mesas,
 * delegando el acceso a datos al repositorio correspondiente.
 */
// Service layer for table business logic.
// This module encapsulates validation and table state management.
export class TableService {
  /**
   * Lista todas las mesas de un negocio.
   *
   * @param businessId - ID del negocio
   * @returns Array con todas las mesas del negocio
   */
  static async listTables(businessId: string): Promise<Table[]> {
    return tableRepository.listByBusiness(businessId);
  }

  /**
   * Obtiene una mesa específica por su ID dentro de un negocio.
   *
   * @param id - ID de la mesa
   * @param businessId - ID del negocio (para filtrado por alcance)
   * @returns La mesa encontrada o null si no existe
   */
  static async getTableById(id: string, businessId: string): Promise<Table | null> {
    return tableRepository.findById(id, businessId);
  }

  /**
   * Crea una nueva mesa en el negocio.
   *
   * @param data - Datos de la mesa a crear
   * @param data.name - Nombre o identificador de la mesa (ej: "Mesa 1")
   * @param data.capacity - Capacidad de personas (opcional)
   * @param data.status - Estado inicial de la mesa (opcional)
   * @param data.linkedTableId - ID de mesa vinculada para agrupación (opcional)
   * @param data.businessId - ID del negocio al que pertenece
   * @returns La mesa recién creada
   */
  static async createTable(data: {
    name: string;
    capacity?: number;
    status?: TableStatus;
    linkedTableId?: string;
    businessId: string;
  }): Promise<Table> {
    return tableRepository.createTable(data);
  }

  /**
   * Actualiza los datos de una mesa existente.
   * Permite modificar nombre, capacidad, estado y mesa vinculada.
   *
   * @param id - ID de la mesa a actualizar
   * @param businessId - ID del negocio
   * @param data - Datos parciales a actualizar
   * @param data.name - Nuevo nombre de la mesa (opcional)
   * @param data.capacity - Nueva capacidad (opcional)
   * @param data.status - Nuevo estado de la mesa (opcional)
   * @param data.linkedTableId - Nueva mesa vinculada, null para desvincular (opcional)
   * @returns La mesa actualizada
   */
  static async updateTable(id: string, businessId: string, data: {
    name?: string;
    capacity?: number;
    status?: TableStatus;
    linkedTableId?: string | null;
  }): Promise<Table> {
    return tableRepository.updateTable(id, businessId, data);
  }

  /**
   * Elimina una mesa de forma permanente.
   *
   * @param id - ID de la mesa a eliminar
   * @param businessId - ID del negocio
   */
  static async deleteTable(id: string, businessId: string): Promise<void> {
    return tableRepository.deleteTable(id, businessId);
  }
}
