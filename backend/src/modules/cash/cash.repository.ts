import { prisma } from '../../prisma';
import type { CashEntryType } from '@prisma/client';

// Repository layer for cash entry persistence and queries.
export const cashRepository = {
  listByBusiness: async (businessId: string, startDate?: Date, endDate?: Date) => {
    const where: any = { businessId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return prisma.cashEntry.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string, businessId: string) => {
    return prisma.cashEntry.findFirst({
      where: { id, businessId },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    });
  },

  createEntry: async (data: {
    businessId: string;
    userId: string;
    type: CashEntryType;
    amount: number;
    orderId?: string;
    note?: string;
  }) => {
    return prisma.cashEntry.create({
      data: {
        businessId: data.businessId,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        orderId: data.orderId,
        note: data.note
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    });
  },

  deleteEntry: async (id: string, businessId: string) => {
    return prisma.cashEntry.deleteMany({
      where: { id, businessId }
    });
  },

  getTotalByType: async (businessId: string, type: CashEntryType, startDate?: Date, endDate?: Date) => {
    const where: any = { businessId, type };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const result = await prisma.cashEntry.aggregate({
      where,
      _sum: { amount: true }
    });

    return result._sum.amount || 0;
  },

  getDailySummary: async (businessId: string, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await prisma.cashEntry.findMany({
      where: {
        businessId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const summary = {
      opening: 0,
      closing: 0,
      sales: 0,
      expenses: 0,
      adjustments: 0,
      entries
    };

    for (const entry of entries) {
      if (entry.type === 'OPENING') summary.opening = entry.amount;
      else if (entry.type === 'CLOSING') summary.closing = entry.amount;
      else if (entry.type === 'SALE') summary.sales += entry.amount;
      else if (entry.type === 'EXPENSE') summary.expenses += entry.amount;
      else if (entry.type === 'ADJUSTMENT') summary.adjustments += entry.amount;
    }

    return summary;
  }
};
