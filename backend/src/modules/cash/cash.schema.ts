export const cashEntryResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    businessId: { type: 'string' },
    userId: { type: 'string' },
    type: { type: 'string', enum: ['OPENING', 'CLOSING', 'SALE', 'EXPENSE', 'ADJUSTMENT'] },
    amount: { type: 'number' },
    orderId: { type: 'string' },
    note: { type: 'string' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' }
      }
    },
    createdAt: { type: 'string' }
  },
  required: ['id', 'businessId', 'userId', 'type', 'amount', 'createdAt']
};

export const cashEntryListResponseSchema = {
  type: 'array',
  items: cashEntryResponseSchema
};

export const createCashEntryBodySchema = {
  type: 'object',
  required: ['type', 'amount'],
  properties: {
    type: { type: 'string', enum: ['OPENING', 'CLOSING', 'SALE', 'EXPENSE', 'ADJUSTMENT'] },
    amount: { type: 'number', minimum: 0 },
    orderId: { type: 'string' },
    note: { type: 'string' }
  }
};

export const openCashBodySchema = {
  type: 'object',
  required: ['amount'],
  properties: {
    amount: { type: 'number', minimum: 0 },
    note: { type: 'string' }
  }
};

export const closeCashBodySchema = {
  type: 'object',
  required: ['amount'],
  properties: {
    amount: { type: 'number', minimum: 0 },
    note: { type: 'string' }
  }
};

export const recordExpenseBodySchema = {
  type: 'object',
  required: ['amount'],
  properties: {
    amount: { type: 'number', minimum: 0 },
    note: { type: 'string' }
  }
};

export const cashEntryParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
};

export const dailySummaryResponseSchema = {
  type: 'object',
  properties: {
    opening: { type: 'number' },
    closing: { type: 'number' },
    sales: { type: 'number' },
    expenses: { type: 'number' },
    adjustments: { type: 'number' },
    entries: {
      type: 'array',
      items: cashEntryResponseSchema
    }
  }
};
