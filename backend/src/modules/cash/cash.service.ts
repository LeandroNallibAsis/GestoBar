import { cashRepository } from './cash.repository';
import type { CashEntryType } from '@prisma/client';

// Service layer for cash management business logic.
export class CashService {
  static async listEntries(businessId: string, startDate?: Date, endDate?: Date) {
    return cashRepository.listByBusiness(businessId, startDate, endDate);
  }

  static async getEntryById(id: string, businessId: string) {
    return cashRepository.findById(id, businessId);
  }

  static async recordEntry(data: {
    businessId: string;
    userId: string;
    type: CashEntryType;
    amount: number;
    orderId?: string;
    note?: string;
  }) {
    if (data.amount < 0) {
      throw new Error('Amount must be greater than or equal to 0');
    }

    return cashRepository.createEntry(data);
  }

  static async deleteEntry(id: string, businessId: string) {
    const result = await cashRepository.deleteEntry(id, businessId);
    if (result.count === 0) {
      throw new Error('Cash entry not found');
    }
    return { success: true };
  }

  static async openCash(businessId: string, userId: string, amount: number, note?: string) {
    if (amount < 0) {
      throw new Error('Opening amount must be greater than or equal to 0');
    }

    return cashRepository.createEntry({
      businessId,
      userId,
      type: 'OPENING',
      amount,
      note: note || 'Cash register opened'
    });
  }

  static async closeCash(businessId: string, userId: string, amount: number, note?: string) {
    if (amount < 0) {
      throw new Error('Closing amount must be greater than or equal to 0');
    }

    return cashRepository.createEntry({
      businessId,
      userId,
      type: 'CLOSING',
      amount,
      note: note || 'Cash register closed'
    });
  }

  static async recordExpense(businessId: string, userId: string, amount: number, note?: string) {
    if (amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    return cashRepository.createEntry({
      businessId,
      userId,
      type: 'EXPENSE',
      amount,
      note
    });
  }

  static async getDailySummary(businessId: string, date: Date) {
    return cashRepository.getDailySummary(businessId, date);
  }

  static async getTotalByType(businessId: string, type: CashEntryType, startDate?: Date, endDate?: Date) {
    return cashRepository.getTotalByType(businessId, type, startDate, endDate);
  }
}
