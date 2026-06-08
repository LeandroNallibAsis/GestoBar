import { prisma } from '../../prisma';

// Repository layer for dashboard metrics and analytics.
export const dashboardRepository = {
  getSalesMetrics: async (businessId: string, startDate: Date, endDate: Date) => {
    const orders = await prisma.order.findMany({
      where: {
        businessId,
        status: 'CLOSED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { items: true }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      orders
    };
  },

  getTopProducts: async (businessId: string, startDate: Date, endDate: Date, limit: number = 5) => {
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          businessId,
          status: 'CLOSED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: { product: true, order: true }
    });

    const productMap = new Map<string, { product: any; totalQuantity: number; totalRevenue: number; orders: number }>();

    for (const item of items) {
      const key = item.product.id;
      if (!productMap.has(key)) {
        productMap.set(key, {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0,
          orders: 0
        });
      }
      const data = productMap.get(key)!;
      data.totalQuantity += item.quantity;
      data.totalRevenue += item.price * item.quantity;
      data.orders += 1;
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  },

  getCashMetrics: async (businessId: string, startDate: Date, endDate: Date) => {
    const [openings, closings, expenses, sales, adjustments] = await Promise.all([
      prisma.cashEntry.aggregate({
        where: { businessId, type: 'OPENING', createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      }),
      prisma.cashEntry.aggregate({
        where: { businessId, type: 'CLOSING', createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      }),
      prisma.cashEntry.aggregate({
        where: { businessId, type: 'EXPENSE', createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      }),
      prisma.cashEntry.aggregate({
        where: { businessId, type: 'SALE', createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      }),
      prisma.cashEntry.aggregate({
        where: { businessId, type: 'ADJUSTMENT', createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      })
    ]);

    return {
      totalOpening: openings._sum.amount || 0,
      totalClosing: closings._sum.amount || 0,
      totalExpenses: expenses._sum.amount || 0,
      totalSalesRecorded: sales._sum.amount || 0,
      totalAdjustments: adjustments._sum.amount || 0
    };
  },

  getTableMetrics: async (businessId: string) => {
    const tables = await prisma.table.findMany({
      where: { businessId },
      include: {
        orders: {
          where: { status: 'CLOSED' }
        }
      }
    });

    return tables.map((table) => ({
      id: table.id,
      name: table.name,
      status: table.status,
      totalOrders: table.orders.length,
      totalRevenue: table.orders.reduce((sum, order) => sum + order.total, 0)
    }));
  },

  getDailySalesChart: async (businessId: string, days: number = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        businessId,
        status: 'CLOSED',
        createdAt: { gte: startDate }
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    const chartData: { date: string; sales: number; orders: number }[] = [];
    const dataMap = new Map<string, { sales: number; orders: number }>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { sales: 0, orders: 0 });
      }
      const data = dataMap.get(dateKey)!;
      data.sales += order.total;
      data.orders += 1;
    }

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      chartData.push({
        date: dateKey,
        sales: dataMap.get(dateKey)?.sales || 0,
        orders: dataMap.get(dateKey)?.orders || 0
      });
    }

    return chartData;
  }
};
