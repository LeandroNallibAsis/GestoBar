/**
 * ============================================================
 * CASH.REPOSITORY.TS
 * ============================================================
 * Capa de acceso a datos para el módulo de caja registradora.
 * Gestiona las operaciones de persistencia y consulta de los
 * movimientos de caja (CashEntry): aperturas, cierres, ventas,
 * gastos y ajustes.
 *
 * Funcionalidades principales:
 * - CRUD de movimientos de caja
 * - Totales agregados por tipo de movimiento
 * - Resumen diario con desglose por categoría
 *
 * Tabla(s) relacionada(s): CashEntry, User
 * Módulo: Caja (Cash)
 * ============================================================
 */

import { prisma } from '../../prisma';
import type { CashEntryType } from '@prisma/client';

// Repository layer for cash entry persistence and queries.
export const cashRepository = {
  /**
   * Lista todos los movimientos de caja de un negocio.
   * Permite filtrar por rango de fechas (opcionales).
   * Incluye datos básicos del usuario que realizó cada movimiento.
   * Resultados ordenados del más reciente al más antiguo.
   *
   * @param businessId - ID del negocio (filtro multi-tenancy)
   * @param startDate - Fecha de inicio del filtro (opcional)
   * @param endDate - Fecha de fin del filtro (opcional)
   * @returns Array de movimientos de caja con datos del usuario
   */
  listByBusiness: async (businessId: string, startDate?: Date, endDate?: Date) => {
    const where: any = { businessId };

    // Construye el filtro de fechas dinámicamente solo si se proporcionan
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate; // Mayor o igual a fecha de inicio
      if (endDate) where.createdAt.lte = endDate;     // Menor o igual a fecha de fin
    }

    return prisma.cashEntry.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } } // Datos básicos del usuario
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Busca un movimiento de caja específico por ID dentro de un negocio.
   *
   * @param id - UUID del movimiento de caja
   * @param businessId - ID del negocio (seguridad multi-tenancy)
   * @returns El movimiento encontrado con datos del usuario, o null
   */
  findById: async (id: string, businessId: string) => {
    return prisma.cashEntry.findFirst({
      where: { id, businessId },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    });
  },

  /**
   * Crea un nuevo movimiento de caja.
   * Registra quién lo hizo (userId), el tipo, monto y opcionalmente
   * el pedido asociado (para ventas) y una nota descriptiva.
   *
   * @param data - Datos del movimiento a crear
   * @param data.businessId - ID del negocio
   * @param data.userId - ID del usuario que realiza el movimiento
   * @param data.type - Tipo de movimiento (OPENING, CLOSING, SALE, EXPENSE, ADJUSTMENT)
   * @param data.amount - Monto del movimiento
   * @param data.orderId - ID del pedido asociado (opcional, solo para SALE)
   * @param data.note - Nota descriptiva (opcional)
   * @returns El movimiento creado con datos del usuario
   */
  createEntry: async (data: {
    businessId: string;
    userId: string;
    type: CashEntryType;
    amount: number;
    orderId?: string;
    note?: string;
  }) => {
    return prisma.cashEntry.create({
      data: {
        businessId: data.businessId,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        orderId: data.orderId,
        note: data.note
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    });
  },

  /**
   * Elimina un movimiento de caja por ID dentro de un negocio.
   * Usa deleteMany con filtro de businessId para seguridad multi-tenant.
   *
   * @param id - UUID del movimiento a eliminar
   * @param businessId - ID del negocio
   * @returns Resultado de la eliminación (count de registros eliminados)
   */
  deleteEntry: async (id: string, businessId: string) => {
    return prisma.cashEntry.deleteMany({
      where: { id, businessId }
    });
  },

  /**
   * Calcula el total acumulado de un tipo de movimiento específico.
   * Usa aggregate con _sum para sumar todos los montos filtrados.
   * Permite filtrar por rango de fechas opcionalmente.
   *
   * @param businessId - ID del negocio
   * @param type - Tipo de movimiento a sumar (ej: SALE, EXPENSE)
   * @param startDate - Fecha de inicio del filtro (opcional)
   * @param endDate - Fecha de fin del filtro (opcional)
   * @returns Total acumulado del tipo especificado (0 si no hay registros)
   */
  getTotalByType: async (businessId: string, type: CashEntryType, startDate?: Date, endDate?: Date) => {
    const where: any = { businessId, type };

    // Construye filtro de fechas dinámicamente
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const result = await prisma.cashEntry.aggregate({
      where,
      _sum: { amount: true } // Suma todos los montos que coinciden con el filtro
    });

    return result._sum.amount || 0; // Retorna 0 si no hay registros
  },

  /**
   * Genera un resumen diario de la caja para una fecha específica.
   * Agrupa los movimientos del día por tipo y calcula subtotales.
   *
   * El resumen incluye:
   * - opening: Monto de apertura de caja
   * - closing: Monto de cierre de caja
   * - sales: Total de ventas del día
   * - expenses: Total de gastos del día
   * - adjustments: Total de ajustes del día
   * - entries: Lista completa de movimientos del día
   *
   * @param businessId - ID del negocio
   * @param date - Fecha del resumen (se usa el día completo 00:00 - 23:59)
   * @returns Objeto con el resumen diario desglosado por tipo
   */
  getDailySummary: async (businessId: string, date: Date) => {
    // Calcula el inicio del día (00:00:00.000)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Calcula el fin del día (23:59:59.999)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtiene todos los movimientos del día ordenados cronológicamente
    const entries = await prisma.cashEntry.findMany({
      where: {
        businessId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      },
      orderBy: { createdAt: 'asc' } // Orden cronológico ascendente para el resumen
    });

    // Inicializa el resumen con valores en cero
    const summary = {
      opening: 0,
      closing: 0,
      sales: 0,
      expenses: 0,
      adjustments: 0,
      entries
    };

    // Clasifica y acumula cada movimiento según su tipo
    for (const entry of entries) {
      if (entry.type === 'OPENING') summary.opening = entry.amount;         // Apertura (se toma el último valor)
      else if (entry.type === 'CLOSING') summary.closing = entry.amount;    // Cierre (se toma el último valor)
      else if (entry.type === 'SALE') summary.sales += entry.amount;        // Ventas se acumulan
      else if (entry.type === 'EXPENSE') summary.expenses += entry.amount;  // Gastos se acumulan
      else if (entry.type === 'ADJUSTMENT') summary.adjustments += entry.amount; // Ajustes se acumulan
    }

    return summary;
  }
};
