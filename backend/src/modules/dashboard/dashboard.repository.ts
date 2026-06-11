import { prisma } from '../../prisma';
import { OrderStatus, CashEntryType } from '@prisma/client';

export const dashboardRepository = {
  getSalesMetrics: async (businessId: string, startDate: Date, endDate: Date) => {
    const result = await prisma.order.aggregate({
      where: {
        businessId,
        status: OrderStatus.PAID,
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true },
      _count: { id: true }
    });

    const totalSales = result._sum.total || 0;
    const totalOrders = result._count.id || 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
    };
  },

  getTopProducts: async (businessId: string, startDate: Date, endDate: Date, limit: number = 5) => {
      const groupedItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          businessId,
          status: OrderStatus.PAID,
          createdAt: { gte: startDate, lte: endDate }
        }
      },
      _sum: { quantity: true },
      _count: { orderId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit
    });

    return Promise.all(
      groupedItems.map(async (item) => {
        const product = await prisma.menuItem.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true }
        });

        const items = await prisma.orderItem.findMany({
          where: {
            productId: item.productId,
            order: {
              businessId,
              status: OrderStatus.PAID,
              createdAt: { gte: startDate, lte: endDate }
            }
          }
        });

        const totalRevenue = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);

        return {
          product: product!,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue,
          orders: item._count.orderId
        };
      })
    );
  },

  getCashMetrics: async (businessId: string, startDate: Date, endDate: Date) => {
    const entries = await prisma.cashEntry.groupBy({
      by: ['type'],
      where: {
        businessId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });

    const findAmount = (type: CashEntryType) => 
      entries.find(e => e.type === type)?._sum.amount || 0;

    return {
      totalOpening: findAmount(CashEntryType.OPENING),
      totalClosing: findAmount(CashEntryType.CLOSING),
      totalExpenses: findAmount(CashEntryType.EXPENSE),
      totalSalesRecorded: findAmount(CashEntryType.SALE),
      totalAdjustments: findAmount(CashEntryType.ADJUSTMENT)
    };
  },

  getTableMetrics: async (businessId: string) => {
    const tables = await prisma.table.findMany({
      where: { businessId },
      include: {
        orders: {
          where: { status: OrderStatus.PAID },
          select: { total: true }
        }
      }
    });

    return tables.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status,
      totalOrders: t.orders.length,
      totalRevenue: t.orders.reduce((sum, o) => sum + o.total, 0)
    }));
  },

  getDailySalesChart: async (businessId: string, days: number = 7) => {
    const chart = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const stats = await prisma.order.aggregate({
        where: {
          businessId,
          status: OrderStatus.PAID,
          createdAt: { gte: start, lte: end }
        },
        _sum: { total: true },
        _count: { id: true }
      });

      chart.push({
        date: start.toISOString().split('T')[0],
        sales: stats._sum.total || 0,
        orders: stats._count.id || 0
      });
    }
    return chart;
  }
};