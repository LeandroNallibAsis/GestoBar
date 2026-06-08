import type { FastifyInstance } from 'fastify';
import { CashService } from './cash.service';
import { JwtUser } from '../auth/auth.types';
import {
  createCashEntryBodySchema,
  cashEntryListResponseSchema,
  cashEntryResponseSchema,
  openCashBodySchema,
  closeCashBodySchema,
  recordExpenseBodySchema,
  cashEntryParamsSchema,
  dailySummaryResponseSchema
} from './cash.schema';

export async function cashRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.get(
    '/cash/entries',
    {
      preValidation: [authenticate],
      schema: {
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string' },
            endDate: { type: 'string' }
          }
        },
        response: {
          200: cashEntryListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      return CashService.listEntries(
        user.businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    }
  );

  server.get(
    '/cash/entries/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: cashEntryParamsSchema,
        response: {
          200: cashEntryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const entry = await CashService.getEntryById(id, user.businessId);
      if (!entry) {
        return reply.status(404).send({ message: 'Cash entry not found' });
      }
      return entry;
    }
  );

  server.post(
    '/cash/entries',
    {
      preValidation: [authenticate],
      schema: {
        body: createCashEntryBodySchema,
        response: {
          201: cashEntryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { type, amount, orderId, note } = request.body as {
        type: string;
        amount: number;
        orderId?: string;
        note?: string;
      };

      const entry = await CashService.recordEntry({
        businessId: user.businessId,
        userId: user.sub,
        type: type as any,
        amount,
        orderId,
        note
      });

      return reply.status(201).send(entry);
    }
  );

  server.post(
    '/cash/open',
    {
      preValidation: [authenticate],
      schema: {
        body: openCashBodySchema,
        response: {
          201: cashEntryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { amount, note } = request.body as { amount: number; note?: string };

      const entry = await CashService.openCash(user.businessId, user.sub, amount, note);

      return reply.status(201).send(entry);
    }
  );

  server.post(
    '/cash/close',
    {
      preValidation: [authenticate],
      schema: {
        body: closeCashBodySchema,
        response: {
          201: cashEntryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { amount, note } = request.body as { amount: number; note?: string };

      const entry = await CashService.closeCash(user.businessId, user.sub, amount, note);

      return reply.status(201).send(entry);
    }
  );

  server.post(
    '/cash/expense',
    {
      preValidation: [authenticate],
      schema: {
        body: recordExpenseBodySchema,
        response: {
          201: cashEntryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { amount, note } = request.body as { amount: number; note?: string };

      const entry = await CashService.recordExpense(user.businessId, user.sub, amount, note);

      return reply.status(201).send(entry);
    }
  );

  server.get(
    '/cash/summary/:date',
    {
      preValidation: [authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['date'],
          properties: {
            date: { type: 'string' }
          }
        },
        response: {
          200: dailySummaryResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { date } = request.params as { date: string };

      const summary = await CashService.getDailySummary(user.businessId, new Date(date));

      return reply.send(summary);
    }
  );

  server.delete(
    '/cash/entries/:id',
    {
      preValidation: [authenticate],
      schema: {
        params: cashEntryParamsSchema
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      await CashService.deleteEntry(id, user.businessId);
      return reply.send({ success: true });
    }
  );
}
