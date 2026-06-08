export const productResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'number' },
    stock: { type: 'number' },
    isActive: { type: 'boolean' },
    categoryId: { type: 'string' },
    businessId: { type: 'string' },
    category: { type: 'object' }
  },
  required: ['id', 'name', 'price', 'stock', 'isActive', 'businessId']
};

export const productListResponseSchema = {
  type: 'array',
  items: productResponseSchema
};

export const createProductBodySchema = {
  type: 'object',
  required: ['name', 'price', 'stock'],
  properties: {
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    stock: { type: 'number', minimum: 0 },
    categoryId: { type: 'string' }
  }
};

export const updateProductBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    stock: { type: 'number', minimum: 0 },
    categoryId: { type: 'string' }
  }
};

export const productParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
};
