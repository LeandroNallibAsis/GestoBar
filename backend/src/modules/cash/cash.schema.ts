/**
 * ============================================================
 * CASH.SCHEMA.TS
 * ============================================================
 * Esquemas de validación JSON Schema para el módulo de caja
 * registradora. Define la estructura de los datos de entrada
 * y salida para los endpoints de movimientos de caja.
 *
 * Incluye esquemas para:
 * - Respuestas de movimientos individuales y listas
 * - Creación genérica de movimientos
 * - Apertura y cierre de caja
 * - Registro de gastos
 * - Resumen diario
 *
 * Tabla(s) relacionada(s): CashEntry, User
 * Módulo: Caja (Cash)
 * ============================================================
 */

/**
 * Esquema de respuesta para un movimiento de caja individual.
 * Incluye los datos del movimiento y la información básica
 * del usuario que lo realizó.
 */
export const cashEntryResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },                                                            // UUID del movimiento
    businessId: { type: 'string' },                                                     // ID del negocio
    userId: { type: 'string' },                                                         // ID del usuario que lo registró
    type: { type: 'string', enum: ['OPENING', 'CLOSING', 'SALE', 'EXPENSE', 'ADJUSTMENT'] }, // Tipo de movimiento
    amount: { type: 'number' },                                                         // Monto del movimiento
    orderId: { type: 'string' },                                                        // Pedido asociado (solo SALE)
    note: { type: 'string' },                                                           // Nota descriptiva opcional
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },      // UUID del usuario
        email: { type: 'string' },    // Email del usuario
        name: { type: 'string' }      // Nombre del usuario
      }
    },
    createdAt: { type: 'string' }     // Fecha de creación (ISO 8601)
  },
  required: ['id', 'businessId', 'userId', 'type', 'amount', 'createdAt']
};

/**
 * Esquema de respuesta para una lista de movimientos de caja.
 * Array de objetos que siguen el esquema cashEntryResponseSchema.
 */
export const cashEntryListResponseSchema = {
  type: 'array',
  items: cashEntryResponseSchema
};

/**
 * Esquema del body para crear un movimiento de caja genérico.
 * Requiere tipo y monto. Opcionalmente acepta pedido asociado y nota.
 */
export const createCashEntryBodySchema = {
  type: 'object',
  required: ['type', 'amount'],
  properties: {
    type: { type: 'string', enum: ['OPENING', 'CLOSING', 'SALE', 'EXPENSE', 'ADJUSTMENT'] }, // Tipo de movimiento
    amount: { type: 'number', minimum: 0 },   // Monto (debe ser positivo)
    orderId: { type: 'string' },               // Pedido asociado (opcional, para SALE)
    note: { type: 'string' }                   // Nota descriptiva (opcional)
  }
};

/**
 * Esquema del body para abrir caja (POST /cash/open).
 * Requiere el monto inicial con el que se abre la caja.
 * Opcionalmente puede incluir una nota.
 */
export const openCashBodySchema = {
  type: 'object',
  required: ['amount'],
  properties: {
    amount: { type: 'number', minimum: 0 },   // Monto de apertura
    note: { type: 'string' }                   // Nota opcional (ej: "Apertura turno mañana")
  }
};

/**
 * Esquema del body para cerrar caja (POST /cash/close).
 * Requiere el monto de cierre (dinero contado al cerrar).
 * Opcionalmente puede incluir una nota.
 */
export const closeCashBodySchema = {
  type: 'object',
  required: ['amount'],
  properties: {
    amount: { type: 'number', minimum: 0 },   // Monto de cierre (dinero en caja)
    note: { type: 'string' }                   // Nota opcional (ej: "Cierre sin diferencias")
  }
};

/**
 * Esquema del body para registrar un gasto (POST /cash/expense).
 * Requiere el monto del gasto. La nota es útil para describir el concepto.
 */
export const recordExpenseBodySchema = {
  type: 'object',
  required: ['amount'],
  properties: {
    amount: { type: 'number', minimum: 0 },   // Monto del gasto
    note: { type: 'string' }                   // Descripción del gasto (ej: "Compra de servilletas")
  }
};

/**
 * Esquema de parámetros de ruta para operaciones sobre un movimiento específico.
 * Requiere el ID del movimiento como parámetro de URL (ej: /cash/:id).
 */
export const cashEntryParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }   // UUID del movimiento de caja
  }
};

/**
 * Esquema de respuesta para el resumen diario de caja.
 * Contiene los totales desglosados por tipo de movimiento
 * y la lista completa de movimientos del día.
 */
export const dailySummaryResponseSchema = {
  type: 'object',
  properties: {
    opening: { type: 'number' },       // Monto de apertura de caja
    closing: { type: 'number' },       // Monto de cierre de caja
    sales: { type: 'number' },         // Total acumulado de ventas
    expenses: { type: 'number' },      // Total acumulado de gastos
    adjustments: { type: 'number' },   // Total acumulado de ajustes
    entries: {
      type: 'array',
      items: cashEntryResponseSchema   // Lista detallada de todos los movimientos del día
    }
  }
};
