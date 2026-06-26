/**
 * ============================================================
 * inventory-item.schema.ts
 * ============================================================
 * Esquemas de validación (Zod/Fastify) para los endpoints de la API.
 * Módulo: Backend / inventory
 * ============================================================
 */
export const InventoryItemResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    cost: { type: 'number' },
    stock: { type: 'number' },
    unit: { type: ['string', 'null'] },
    isActive: { type: 'boolean' },
    categoryId: { type: ['string', 'null'] },
    businessId: { type: 'string' },
    category: { type: 'object' }
  },
  required: ['id', 'name', 'cost', 'stock', 'isActive', 'businessId']
};

export const InventoryItemListResponseSchema = {
  type: 'array',
  items: InventoryItemResponseSchema
};

export const createInventoryItemBodySchema = {
  type: 'object',
  required: ['name', 'cost'],
  properties: {
    name: { type: 'string', minLength: 1 },
    unit: { type: 'string' },
    cost: { type: 'number', minimum: 0 },
    stock: { type: 'number', minimum: 0 },
    categoryId: { type: 'string' }
  }
};

export const updateInventoryItemBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    unit: { type: 'string' },
    cost: { type: 'number', minimum: 0 },
    stock: { type: 'number', minimum: 0 },
    isActive: { type: 'boolean' },
    categoryId: { type: 'string' }
  }
};

export const InventoryItemParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
};
