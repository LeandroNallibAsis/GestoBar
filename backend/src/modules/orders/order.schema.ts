export const orderItemSchema = {
  type: 'object',
  required: ['productId', 'quantity', 'price'],
  properties: {
    productId: { type: 'string' },
    quantity: { type: 'number', minimum: 1 },
    price: { type: 'number', minimum: 0 }
  }
};

export const orderResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    tableId: { type: 'string' },
    businessId: { type: 'string' },
    status: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          quantity: { type: 'number' },
          price: { type: 'number' },
          product: { type: 'object' }
        }
      }
    },
    total: { type: 'number' },
    createdAt: { type: 'string' }
  },
  required: ['id', 'businessId', 'status', 'items', 'total', 'createdAt']
};

export const orderListResponseSchema = {
  type: 'array',
  items: orderResponseSchema
};

export const createOrderBodySchema = {
  type: 'object',
  required: ['items'],
  properties: {
    tableId: { type: 'string' },
    items: {
      type: 'array',
      minItems: 1,
      items: orderItemSchema
    }
  }
};

export const updateOrderBodySchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['OPEN', 'CLOSED', 'CANCELLED']
    },
    tableId: { type: 'string' }
  }
};

export const updateOrderParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
};
