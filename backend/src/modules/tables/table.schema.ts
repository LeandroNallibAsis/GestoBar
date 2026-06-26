/**
 * ============================================================
 * TABLE.SCHEMA.TS
 * ============================================================
 * Esquemas de validación JSON Schema para el módulo de mesas.
 * Define la estructura de los datos de entrada y salida para
 * los endpoints CRUD de mesas del establecimiento.
 *
 * Tabla(s) relacionada(s): Table
 * Módulo: Mesas (Tables)
 * ============================================================
 */

/**
 * Esquema de respuesta para una mesa individual.
 * Incluye todos los datos de la mesa, su estado actual
 * y la vinculación opcional con otra mesa.
 */
export const tableResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },                         // UUID de la mesa
    name: { type: 'string' },                        // Nombre/número de la mesa
    status: { type: 'string' },                      // Estado actual (FREE, OCCUPIED, etc.)
    capacity: { type: ['number', 'null'] },           // Capacidad de personas (nullable)
    linkedTableId: { type: ['string', 'null'] },      // Mesa vinculada (nullable, para mesas unidas)
    businessId: { type: 'string' }                   // ID del negocio
  },
  required: ['id', 'name', 'status', 'businessId']
};

/**
 * Esquema de respuesta para una lista de mesas.
 * Array de objetos que siguen el esquema tableResponseSchema.
 */
export const tableListResponseSchema = {
  type: 'array',
  items: tableResponseSchema
};

/**
 * Esquema del body para crear una nueva mesa (POST /tables).
 * Solo el nombre es obligatorio. Capacidad, estado y vinculación son opcionales.
 */
export const createTableBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },             // Nombre de la mesa (obligatorio)
    capacity: { type: 'number' },          // Capacidad de personas (opcional)
    linkedTableId: { type: 'string' },     // ID de mesa a vincular (opcional)
    status: {
      type: 'string',
      enum: ['FREE', 'OCCUPIED', 'RESERVED', 'PENDING_PAYMENT'] // Estados válidos
    }
  }
};

/**
 * Esquema del body para actualizar una mesa (PATCH /tables/:id).
 * Todos los campos son opcionales (se actualizan solo los enviados).
 * linkedTableId acepta null para desvincular una mesa.
 */
export const updateTableBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },                        // Nuevo nombre
    capacity: { type: 'number' },                     // Nueva capacidad
    linkedTableId: { type: ['string', 'null'] },      // Nueva vinculación (null para desvincular)
    status: {
      type: 'string',
      enum: ['FREE', 'OCCUPIED', 'RESERVED', 'PENDING_PAYMENT'] // Estados válidos
    }
  }
};
