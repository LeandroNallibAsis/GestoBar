export const metricsQuerySchema = {
  type: 'object',
  properties: {
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    days: { type: 'number', minimum: 1 },
    limit: { type: 'number', minimum: 1 }
  }
};

export const salesMetricsResponseSchema = {
  type: 'object',
  properties: {
    totalSales: { type: 'number' },
    totalOrders: { type: 'number' },
    averageOrderValue: { type: 'number' },
    orders: {
      type: 'array',
      items: { type: 'object' }
    }
  }
};

export const productMetricSchema = {
  type: 'object',
  properties: {
    product: { type: 'object' },
    totalQuantity: { type: 'number' },
    totalRevenue: { type: 'number' },
    orders: { type: 'number' }
  }
};

export const topProductsResponseSchema = {
  type: 'array',
  items: productMetricSchema
};

export const cashMetricsResponseSchema = {
  type: 'object',
  properties: {
    totalOpening: { type: 'number' },
    totalClosing: { type: 'number' },
    totalExpenses: { type: 'number' },
    totalSalesRecorded: { type: 'number' },
    totalAdjustments: { type: 'number' }
  }
};

export const tableMetricSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    status: { type: 'string' },
    totalOrders: { type: 'number' },
    totalRevenue: { type: 'number' }
  }
};

export const tableMetricsResponseSchema = {
  type: 'array',
  items: tableMetricSchema
};

export const chartPointSchema = {
  type: 'object',
  properties: {
    date: { type: 'string' },
    sales: { type: 'number' },
    orders: { type: 'number' }
  }
};

export const dailySalesChartResponseSchema = {
  type: 'array',
  items: chartPointSchema
};

export const dashboardOverviewResponseSchema = {
  type: 'object',
  properties: {
    period: {
      type: 'object',
      properties: {
        startDate: { type: 'string' },
        endDate: { type: 'string' }
      }
    },
    sales: salesMetricsResponseSchema,
    topProducts: topProductsResponseSchema,
    cash: cashMetricsResponseSchema,
    tables: tableMetricsResponseSchema,
    dailyChart: dailySalesChartResponseSchema
  }
};
