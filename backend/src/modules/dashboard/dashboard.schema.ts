/**
 * ============================================================
 * dashboard.schema.ts
 * ============================================================
 * Esquemas de validación (Zod/Fastify) para los endpoints de la API.
 * Módulo: Backend / dashboard
 * ============================================================
 */
export const metricsQuerySchema = {
  type: 'object',
  properties: {
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' }
  }
};

export const salesMetricsResponseSchema = {
  type: 'object',
  properties: {
    totalSales: { type: 'number' },
    totalOrders: { type: 'number' },
    averageOrderValue: { type: 'number' }
  }
};

export const topProductsResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' }
        }
      },
      totalQuantity: { type: 'number' },
      totalRevenue: { type: 'number' },
      orders: { type: 'number' }
    }
  }
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

export const tableMetricsResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string' },
      totalOrders: { type: 'number' },
      totalRevenue: { type: 'number' }
    }
  }
};

export const dailySalesChartResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      date: { type: 'string' },
      sales: { type: 'number' },
      orders: { type: 'number' }
    }
  }
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