/**
 * ============================================================
 * cash.service.ts
 * ============================================================
 * Servicio de gestión de caja del sistema GestoBar.
 * Contiene la lógica de negocio para el registro de movimientos
 * de caja: apertura, cierre, ingresos, egresos y gastos.
 *
 * Reglas de negocio importantes:
 *   - Los montos no pueden ser negativos para ningún tipo de entrada.
 *   - Los gastos (EXPENSE) deben ser estrictamente mayores a 0.
 *   - Si no se proporciona una nota en apertura/cierre, se usa
 *     un mensaje por defecto.
 *   - Se pueden filtrar entradas por rango de fechas.
 *
 * Tabla(s) relacionada(s): CashEntry
 * Módulo: Caja (cash)
 * ============================================================
 */

import { cashRepository } from './cash.repository';
import type { CashEntryType } from '@prisma/client';

/**
 * Servicio estático de gestión de caja.
 * Orquesta las operaciones de movimientos de caja con
 * validaciones de negocio antes de delegar al repositorio.
 */
// Service layer for cash management business logic.
export class CashService {
  /**
   * Lista los movimientos de caja de un negocio, opcionalmente
   * filtrados por un rango de fechas.
   *
   * @param businessId - ID del negocio
   * @param startDate - Fecha de inicio del filtro (opcional)
   * @param endDate - Fecha de fin del filtro (opcional)
   * @returns Array de entradas de caja
   */
  static async listEntries(businessId: string, startDate?: Date, endDate?: Date) {
    return cashRepository.listByBusiness(businessId, startDate, endDate);
  }

  /**
   * Obtiene un movimiento de caja específico por su ID.
   *
   * @param id - ID de la entrada de caja
   * @param businessId - ID del negocio
   * @returns La entrada encontrada o null
   */
  static async getEntryById(id: string, businessId: string) {
    return cashRepository.findById(id, businessId);
  }

  /**
   * Registra un nuevo movimiento de caja genérico.
   * Valida que el monto no sea negativo.
   *
   * @param data - Datos del movimiento de caja
   * @param data.businessId - ID del negocio
   * @param data.userId - ID del usuario que registra el movimiento
   * @param data.type - Tipo de movimiento (INCOME, EXPENSE, OPENING, CLOSING)
   * @param data.amount - Monto del movimiento (debe ser >= 0)
   * @param data.orderId - ID del pedido asociado (opcional)
   * @param data.note - Nota descriptiva (opcional)
   * @returns La entrada de caja creada
   * @throws Error si el monto es negativo
   */
  static async recordEntry(data: {
    businessId: string;
    userId: string;
    type: CashEntryType;
    amount: number;
    orderId?: string;
    note?: string;
  }) {
    // Validación: el monto no puede ser negativo
    if (data.amount < 0) {
      throw new Error('Amount must be greater than or equal to 0');
    }

    return cashRepository.createEntry(data);
  }

  /**
   * Elimina un movimiento de caja por su ID.
   * Verifica que la entrada exista antes de confirmar la eliminación.
   *
   * @param id - ID de la entrada a eliminar
   * @param businessId - ID del negocio
   * @returns Objeto con success: true si se eliminó correctamente
   * @throws Error si la entrada no fue encontrada
   */
  static async deleteEntry(id: string, businessId: string) {
    const result = await cashRepository.deleteEntry(id, businessId);
    // Verifica que se haya eliminado al menos un registro
    if (result.count === 0) {
      throw new Error('Cash entry not found');
    }
    return { success: true };
  }

  /**
   * Registra la apertura de caja del día.
   * Crea una entrada de tipo OPENING con el monto inicial.
   *
   * @param businessId - ID del negocio
   * @param userId - ID del usuario que abre la caja
   * @param amount - Monto inicial de apertura (debe ser >= 0)
   * @param note - Nota descriptiva (por defecto: 'Cash register opened')
   * @returns La entrada de apertura creada
   * @throws Error si el monto es negativo
   */
  static async openCash(businessId: string, userId: string, amount: number, note?: string) {
    // Validación: el monto de apertura no puede ser negativo
    if (amount < 0) {
      throw new Error('Opening amount must be greater than or equal to 0');
    }

    return cashRepository.createEntry({
      businessId,
      userId,
      type: 'OPENING',
      amount,
      note: note || 'Cash register opened' // Nota por defecto si no se proporciona
    });
  }

  /**
   * Registra el cierre de caja del día.
   * Crea una entrada de tipo CLOSING con el monto final contado.
   *
   * @param businessId - ID del negocio
   * @param userId - ID del usuario que cierra la caja
   * @param amount - Monto al cierre (debe ser >= 0)
   * @param note - Nota descriptiva (por defecto: 'Cash register closed')
   * @returns La entrada de cierre creada
   * @throws Error si el monto es negativo
   */
  static async closeCash(businessId: string, userId: string, amount: number, note?: string) {
    // Validación: el monto de cierre no puede ser negativo
    if (amount < 0) {
      throw new Error('Closing amount must be greater than or equal to 0');
    }

    return cashRepository.createEntry({
      businessId,
      userId,
      type: 'CLOSING',
      amount,
      note: note || 'Cash register closed' // Nota por defecto si no se proporciona
    });
  }

  /**
   * Registra un gasto (egreso) de caja.
   * Los gastos deben ser estrictamente mayores a 0.
   *
   * @param businessId - ID del negocio
   * @param userId - ID del usuario que registra el gasto
   * @param amount - Monto del gasto (debe ser > 0)
   * @param note - Descripción del gasto (opcional)
   * @returns La entrada de gasto creada
   * @throws Error si el monto es menor o igual a 0
   */
  static async recordExpense(businessId: string, userId: string, amount: number, note?: string) {
    // Validación: los gastos deben ser mayores a cero
    if (amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    return cashRepository.createEntry({
      businessId,
      userId,
      type: 'EXPENSE',
      amount,
      note
    });
  }

  /**
   * Obtiene el resumen diario de caja para una fecha específica.
   * Incluye totales por tipo de movimiento y balance del día.
   *
   * @param businessId - ID del negocio
   * @param date - Fecha del día a consultar
   * @returns Objeto con el resumen diario de caja
   */
  static async getDailySummary(businessId: string, date: Date) {
    return cashRepository.getDailySummary(businessId, date);
  }

  /**
   * Obtiene el total acumulado de un tipo específico de movimiento,
   * opcionalmente filtrado por rango de fechas.
   *
   * @param businessId - ID del negocio
   * @param type - Tipo de movimiento a totalizar
   * @param startDate - Fecha de inicio del filtro (opcional)
   * @param endDate - Fecha de fin del filtro (opcional)
   * @returns Total acumulado del tipo de movimiento especificado
   */
  static async getTotalByType(businessId: string, type: CashEntryType, startDate?: Date, endDate?: Date) {
    return cashRepository.getTotalByType(businessId, type, startDate, endDate);
  }
}
