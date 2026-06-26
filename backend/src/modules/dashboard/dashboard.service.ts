/**
 * ============================================================
 * dashboard.service.ts
 * ============================================================
 * Servicio del panel de control (dashboard) del sistema GestoBar.
 * Contiene la lógica de negocio para calcular y agregar métricas
 * analíticas del negocio: ventas, productos más vendidos,
 * movimientos de caja, ocupación de mesas y gráficos diarios.
 *
 * Este servicio no modifica datos; solo consulta y agrega
 * información de múltiples tablas para generar reportes.
 *
 * Comportamiento por defecto:
 *   - Si no se especifican fechas, se usan los últimos 30 días.
 *   - El overview del dashboard ejecuta todas las métricas en
 *     paralelo usando Promise.all para optimizar rendimiento.
 *
 * Tabla(s) relacionada(s): Order, OrderItem, CashEntry, Table
 * Módulo: Dashboard
 * ============================================================
 */

import { dashboardRepository } from './dashboard.repository';

/**
 * Servicio estático del panel de control.
 * Orquesta las consultas de métricas y reportes analíticos
 * delegando el acceso a datos al repositorio correspondiente.
 */
// Service layer for dashboard analytics and metrics.
export class DashboardService {
  /**
   * Obtiene las métricas de ventas para un rango de fechas.
   * Si no se especifican fechas, usa los últimos 30 días.
   *
   * @param businessId - ID del negocio
   * @param startDate - Fecha de inicio del período (opcional, default: 30 días atrás)
   * @param endDate - Fecha de fin del período (opcional, default: hoy)
   * @returns Métricas de ventas (total, cantidad, promedio, etc.)
   */
  static async getSalesMetrics(businessId: string, startDate?: Date, endDate?: Date) {
    // Si no se especifican fechas, utiliza los últimos 30 días por defecto
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    return dashboardRepository.getSalesMetrics(businessId, start, end);
  }

  /**
   * Obtiene los productos más vendidos en un rango de fechas.
   * Si no se especifican fechas, usa los últimos 30 días.
   *
   * @param businessId - ID del negocio
   * @param startDate - Fecha de inicio (opcional, default: 30 días atrás)
   * @param endDate - Fecha de fin (opcional, default: hoy)
   * @param limit - Cantidad máxima de productos a devolver (opcional)
   * @returns Array de productos ordenados por cantidad vendida
   */
  static async getTopProducts(businessId: string, startDate?: Date, endDate?: Date, limit?: number) {
    // Si no se especifican fechas, utiliza los últimos 30 días por defecto
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    return dashboardRepository.getTopProducts(businessId, start, end, limit);
  }

  /**
   * Obtiene las métricas de movimientos de caja para un rango de fechas.
   * Incluye totales de ingresos, egresos, aperturas y cierres.
   *
   * @param businessId - ID del negocio
   * @param startDate - Fecha de inicio (opcional, default: 30 días atrás)
   * @param endDate - Fecha de fin (opcional, default: hoy)
   * @returns Métricas de caja (totales por tipo de movimiento)
   */
  static async getCashMetrics(businessId: string, startDate?: Date, endDate?: Date) {
    // Si no se especifican fechas, utiliza los últimos 30 días por defecto
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    return dashboardRepository.getCashMetrics(businessId, start, end);
  }

  /**
   * Obtiene métricas de rendimiento de las mesas.
   * Incluye información sobre ocupación, disponibilidad, etc.
   *
   * @param businessId - ID del negocio
   * @returns Métricas de las mesas del negocio
   */
  static async getTableMetrics(businessId: string) {
    return dashboardRepository.getTableMetrics(businessId);
  }

  /**
   * Obtiene datos para el gráfico de ventas diarias.
   *
   * @param businessId - ID del negocio
   * @param days - Cantidad de días a incluir en el gráfico (opcional)
   * @returns Array de datos diarios para graficar ventas
   */
  static async getDailySalesChart(businessId: string, days?: number) {
    return dashboardRepository.getDailySalesChart(businessId, days);
  }

  /**
   * Obtiene un resumen completo del dashboard con todas las métricas.
   * Ejecuta todas las consultas en paralelo (Promise.all) para
   * optimizar el tiempo de respuesta.
   *
   * Incluye:
   *   - Métricas de ventas de los últimos 30 días
   *   - Top 5 productos más vendidos
   *   - Métricas de caja
   *   - Estado actual de las mesas
   *   - Gráfico de ventas de los últimos 7 días
   *
   * @param businessId - ID del negocio
   * @returns Objeto con todas las métricas del dashboard
   */
  static async getDashboardOverview(businessId: string) {
    // Define el período de análisis: últimos 30 días
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    // Ejecuta todas las consultas de métricas en paralelo para optimizar rendimiento
    const [salesMetrics, topProducts, cashMetrics, tableMetrics, dailyChart] = await Promise.all([
      this.getSalesMetrics(businessId, startDate, endDate),
      this.getTopProducts(businessId, startDate, endDate, 5), // Limita a los 5 productos más vendidos
      this.getCashMetrics(businessId, startDate, endDate),
      this.getTableMetrics(businessId),
      this.getDailySalesChart(businessId, 7) // Gráfico de los últimos 7 días
    ]);

    // Estructura la respuesta con todas las métricas agrupadas
    return {
      period: { startDate, endDate },
      sales: salesMetrics,
      topProducts,
      cash: cashMetrics,
      tables: tableMetrics,
      dailyChart
    };
  }
}
