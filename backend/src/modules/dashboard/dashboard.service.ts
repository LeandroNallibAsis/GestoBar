import { dashboardRepository } from './dashboard.repository';

// Service layer for dashboard analytics and metrics.
export class DashboardService {
  static async getSalesMetrics(businessId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    return dashboardRepository.getSalesMetrics(businessId, start, end);
  }

  static async getTopProducts(businessId: string, startDate?: Date, endDate?: Date, limit?: number) {
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    return dashboardRepository.getTopProducts(businessId, start, end, limit);
  }

  static async getCashMetrics(businessId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    return dashboardRepository.getCashMetrics(businessId, start, end);
  }

  static async getTableMetrics(businessId: string) {
    return dashboardRepository.getTableMetrics(businessId);
  }

  static async getDailySalesChart(businessId: string, days?: number) {
    return dashboardRepository.getDailySalesChart(businessId, days);
  }

  static async getDashboardOverview(businessId: string) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const [salesMetrics, topProducts, cashMetrics, tableMetrics, dailyChart] = await Promise.all([
      this.getSalesMetrics(businessId, startDate, endDate),
      this.getTopProducts(businessId, startDate, endDate, 5),
      this.getCashMetrics(businessId, startDate, endDate),
      this.getTableMetrics(businessId),
      this.getDailySalesChart(businessId, 7)
    ]);

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
