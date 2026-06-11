export const tableResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    status: { type: 'string' },
    capacity: { type: ['number', 'null'] },
    linkedTableId: { type: ['string', 'null'] },
    businessId: { type: 'string' }
  },
  required: ['id', 'name', 'status', 'businessId']
};

export const tableListResponseSchema = {
  type: 'array',
  items: tableResponseSchema
};

export const createTableBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
    capacity: { type: 'number' },
    linkedTableId: { type: 'string' },
    status: {
      type: 'string',
      enum: ['FREE', 'OCCUPIED', 'RESERVED', 'PENDING_PAYMENT']
    }
  }
};

export const updateTableBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    capacity: { type: 'number' },
    linkedTableId: { type: ['string', 'null'] },
    status: {
      type: 'string',
      enum: ['FREE', 'OCCUPIED', 'RESERVED', 'PENDING_PAYMENT']
    }
  }
};
