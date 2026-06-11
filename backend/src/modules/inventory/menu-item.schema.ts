export const MenuItemResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'number' },
    description: { type: ['string', 'null'] },
    isActive: { type: 'boolean' },
    categoryId: { type: ['string', 'null'] },
    businessId: { type: 'string' },
    category: { type: 'object' }
  },
  required: ['id', 'name', 'price', 'isActive', 'businessId']
};

export const MenuItemListResponseSchema = {
  type: 'array',
  items: MenuItemResponseSchema
};

export const createMenuItemBodySchema = {
  type: 'object',
  required: ['name', 'price'],
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    categoryId: { type: 'string' }
  }
};

export const updateMenuItemBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    isActive: { type: 'boolean' },
    categoryId: { type: 'string' }
  }
};

export const MenuItemParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
};
