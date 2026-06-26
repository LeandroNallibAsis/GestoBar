/**
 * ============================================================
 * CATEGORY.SCHEMA.TS
 * ============================================================
 * Esquemas de validación JSON Schema para el módulo de categorías.
 * Define la estructura de los datos de entrada y salida para
 * los endpoints CRUD de categorías de menú e inventario.
 *
 * Tabla(s) relacionada(s): Category
 * Módulo: Inventario / Categorías
 * ============================================================
 */

/**
 * Esquema de respuesta para una categoría individual.
 * Incluye el estado activo para que el frontend pueda
 * distinguir categorías activas de las eliminadas lógicamente.
 */
export const categoryResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },                                 // UUID de la categoría
    name: { type: 'string' },                                // Nombre de la categoría
    isActive: { type: 'boolean' },                           // Estado: true=activa, false=eliminada lógicamente
    businessId: { type: 'string' },                          // ID del negocio
    createdAt: { type: 'string', format: 'date-time' }       // Fecha de creación (ISO 8601)
  },
  required: ['id', 'name', 'isActive', 'businessId']
};

/**
 * Esquema de respuesta para una lista de categorías.
 * Array de objetos que siguen el esquema categoryResponseSchema.
 */
export const categoryListResponseSchema = {
  type: 'array',
  items: categoryResponseSchema
};

/**
 * Esquema del body para crear una nueva categoría (POST /categories).
 * Solo el nombre es obligatorio, con longitud mínima de 1 carácter.
 */
export const createCategoryBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 }   // Nombre de la categoría (mínimo 1 carácter)
  }
};

/**
 * Esquema del body para actualizar una categoría (PATCH /categories/:id).
 * Ambos campos son opcionales (se actualizan solo los enviados).
 * isActive permite reactivar categorías eliminadas lógicamente.
 */
export const updateCategoryBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },   // Nuevo nombre (opcional)
    isActive: { type: 'boolean' }              // Cambiar estado activo/inactivo (opcional)
  }
};

/**
 * Esquema de parámetros de ruta para operaciones sobre una categoría específica.
 * Requiere el ID como parámetro de URL (ej: /categories/:id).
 */
export const categoryParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }   // UUID de la categoría
  }
};