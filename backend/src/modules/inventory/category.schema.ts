export const categoryResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    isActive: { type: 'boolean' },
    businessId: { type: 'string' },
    products: {
      type: 'array',
      items: { type: 'object' }
    }
  },
  required: ['id', 'name', 'isActive', 'businessId']
};

export const categoryListResponseSchema = {
  type: 'array',
  items: categoryResponseSchema
};

export const createCategoryBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 }
  }
};

export const updateCategoryBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 }
  }
};

export const categoryParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
};
