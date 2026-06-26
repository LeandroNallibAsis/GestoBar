/**
 * ============================================================
 * dashboard.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) del panel de control (dashboard)
 * del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   GET /dashboard              - Resumen completo con todas las métricas
 *   GET /dashboard/sales        - Métricas de ventas por rango de fechas
 *   GET /dashboard/top-products - Productos más vendidos
 *   GET /dashboard/cash         - Métricas de movimientos de caja
 *   GET /dashboard/tables       - Métricas de rendimiento de mesas
 *   GET /dashboard/daily-sales  - Datos para gráfico de ventas diarias
 *
 * Todos los endpoints son de solo lectura (GET) y requieren
 * autenticación JWT. Los datos se filtran automáticamente
 * por el negocio del usuario autenticado.
 *
 * Tabla(s) relacionada(s): Order, OrderItem, CashEntry, Table
 * Módulo: Dashboard
 * ============================================================
 */

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

/**
 * Registra las rutas del panel de control en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación
 */
export async function dashboardRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── GET /dashboard ────────────────────────────────────────
  // Resumen principal del dashboard con todas las métricas consolidadas.
  // Incluye ventas, top productos, caja, mesas y gráfico diario.
  // Las métricas cubren los últimos 30 días por defecto.
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

  // ── GET /dashboard/sales ──────────────────────────────────
  // Métricas de ventas para un rango de fechas personalizable.
  // Acepta startDate y endDate como query parameters opcionales.
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

      // Convierte las fechas de string a Date si se proporcionan
      return DashboardService.getSalesMetrics(
        user.businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    }
  );

  // ── GET /dashboard/top-products ───────────────────────────
  // Productos más vendidos, con filtro opcional de fechas y límite.
  // El parámetro "limit" controla cuántos productos devolver.
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

  // ── GET /dashboard/cash ───────────────────────────────────
  // Métricas de movimientos de caja (ingresos, egresos, etc.)
  // con filtro opcional de fechas.
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

  // ── GET /dashboard/tables ─────────────────────────────────
  // Métricas de rendimiento y estado actual de las mesas.
  // No requiere filtros de fecha ya que muestra el estado actual.
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

  // ── GET /dashboard/daily-sales ────────────────────────────
  // Datos para el gráfico de ventas diarias.
  // El parámetro "days" controla cuántos días incluir (opcional).
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
