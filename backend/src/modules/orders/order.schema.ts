/**
 * ============================================================
 * ORDER.SCHEMA.TS
 * ============================================================
 * Esquemas de validación JSON Schema para el módulo de pedidos.
 * Define la estructura de los datos de entrada (request body)
 * y salida (response) para los endpoints de pedidos.
 *
 * Esquemas incluidos:
 * - orderItemSchema: Estructura de un ítem individual del pedido
 * - orderResponseSchema: Respuesta con datos completos del pedido
 * - createOrderBodySchema: Body para crear un nuevo pedido
 * - updateOrderBodySchema: Body para actualizar estado/mesa del pedido
 *
 * Tabla(s) relacionada(s): Order, OrderItem
 * Módulo: Pedidos (Orders)
 * ============================================================
 */

/**
 * Esquema de un ítem individual dentro de un pedido.
 * Representa un producto con su cantidad y precio unitario.
 * Se usa como sub-esquema dentro de createOrderBodySchema.
 */
export const orderItemSchema = {
  type: 'object',
  required: ['productId', 'quantity', 'price'],
  properties: {
    productId: { type: 'string' },              // UUID del MenuItem
    quantity: { type: 'number', minimum: 1 },    // Cantidad mínima: 1 unidad
    price: { type: 'number', minimum: 0 }        // Precio unitario al momento de la venta
  }
};

/**
 * Esquema de respuesta para un pedido completo.
 * Incluye todos los datos del pedido, sus ítems con productos,
 * datos del mesero y la mesa asociada.
 */
export const orderResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },                           // UUID del pedido
    tableId: { type: ['string', 'null'] },             // Mesa asociada (null para takeaway/delivery)
    businessId: { type: 'string' },                    // ID del negocio
    type: { type: 'string' },                          // Tipo: TABLE, TAKEAWAY, DELIVERY
    deliveryAddress: { type: ['string', 'null'] },     // Dirección de entrega (solo DELIVERY)
    status: { type: 'string' },                        // Estado actual del pedido
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },             // UUID del ítem
          quantity: { type: 'number' },        // Cantidad pedida
          price: { type: 'number' },           // Precio unitario congelado
          product: { type: 'object' }          // Datos del MenuItem asociado
        }
      }
    },
    total: { type: 'number' },                         // Total calculado del pedido
    waiter: {
      type: 'object',
      properties: {
        id: { type: 'string' },               // UUID del mesero
        name: { type: 'string' }              // Nombre del mesero
      }
    },
    createdAt: { type: 'string' }                      // Fecha de creación (ISO 8601)
  },
  required: ['id', 'businessId', 'status', 'items', 'total', 'createdAt']
};

/**
 * Esquema de respuesta para una lista de pedidos.
 * Array de objetos que siguen el esquema orderResponseSchema.
 */
export const orderListResponseSchema = {
  type: 'array',
  items: orderResponseSchema
};

/**
 * Esquema del body para crear un nuevo pedido (POST /orders).
 * Requiere al menos un ítem. La mesa, tipo y dirección son opcionales.
 * Si no se especifica tipo, el servicio asume TABLE por defecto.
 */
export const createOrderBodySchema = {
  type: 'object',
  required: ['items'],
  properties: {
    tableId: { type: 'string' },          // UUID de la mesa (opcional, solo para TABLE)
    type: { type: 'string' },              // Tipo de pedido: TABLE, TAKEAWAY, DELIVERY
    deliveryAddress: { type: 'string' },   // Dirección de entrega (solo para DELIVERY)
    items: {
      type: 'array',
      minItems: 1,                         // Mínimo 1 ítem por pedido
      items: orderItemSchema               // Cada ítem sigue el esquema de orderItemSchema
    }
  }
};

/**
 * Esquema del body para actualizar un pedido (PATCH /orders/:id).
 * Permite cambiar el estado del pedido y/o reasignar la mesa.
 * Ambos campos son opcionales (se actualizan solo los enviados).
 */
export const updateOrderBodySchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['OPEN', 'CLOSED', 'CANCELLED']   // Estados permitidos para actualización
    },
    tableId: { type: 'string' }                // Reasignar a otra mesa
  }
};

/**
 * Esquema de parámetros de ruta para operaciones sobre un pedido específico.
 * Requiere el ID del pedido como parámetro de URL (ej: /orders/:id).
 */
export const updateOrderParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }   // UUID del pedido
  }
};
