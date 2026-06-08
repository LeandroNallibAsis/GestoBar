import type { FastifyInstance } from 'fastify';
import { DashboardService } from './dashboard.service';
import { JwtUser } from '../auth/auth.types';
import {
  metricsQuerySchema,
  salesMetricsResponseSchema,
  topProductsResponseSchema,
  cashMetricsResponseSchema,
  tableMetricsResponseSchema,
  dailySalesChartResponseSchema,
  dashboardOverviewResponseSchema
} from './dashboard.schema';

export async function dashboardRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // Main dashboard overview with all metrics
  server.get(
    '/dashboard',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: dashboardOverviewResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return DashboardService.getDashboardOverview(user.businessId);
    }
  );

  // Sales metrics for a date range
  server.get(
    '/dashboard/sales',
    {
      preValidation: [authenticate],
      schema: {
        querystring: metricsQuerySchema,
        response: {
          200: salesMetricsResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      return DashboardService.getSalesMetrics(
        user.businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    }
  );

  // Top selling products
  server.get(
    '/dashboard/top-products',
    {
      preValidation: [authenticate],
      schema: {
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            limit: { type: 'number', minimum: 1 }
          }
        },
        response: {
          200: topProductsResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { startDate, endDate, limit } = request.query as {
        startDate?: string;
        endDate?: string;
        limit?: number;
      };

      return DashboardService.getTopProducts(
        user.businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        limit
      );
    }
  );

  // Cash register metrics
  server.get(
    '/dashboard/cash',
    {
      preValidation: [authenticate],
      schema: {
        querystring: metricsQuerySchema,
        response: {
          200: cashMetricsResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      return DashboardService.getCashMetrics(
        user.businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    }
  );

  // Table performance metrics
  server.get(
    '/dashboard/tables',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: tableMetricsResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return DashboardService.getTableMetrics(user.businessId);
    }
  );

  // Daily sales chart data
  server.get(
    '/dashboard/daily-sales',
    {
      preValidation: [authenticate],
      schema: {
        querystring: {
          type: 'object',
          properties: {
            days: { type: 'number', minimum: 1 }
          }
        },
        response: {
          200: dailySalesChartResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { days } = request.query as { days?: number };

      return DashboardService.getDailySalesChart(user.businessId, days);
    }
  );
}
