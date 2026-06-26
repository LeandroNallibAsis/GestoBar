/**
 * ============================================================
 * cash.routes.ts
 * ============================================================
 * Definición de rutas (endpoints) para la gestión de caja
 * del sistema GestoBar.
 *
 * Endpoints incluidos:
 *   GET    /cash/entries       - Listar movimientos de caja (con filtro de fechas)
 *   GET    /cash/entries/:id   - Obtener un movimiento específico por ID
 *   POST   /cash/entries       - Registrar un nuevo movimiento de caja
 *   POST   /cash/open          - Apertura de caja con monto inicial
 *   POST   /cash/close         - Cierre de caja con monto final
 *   POST   /cash/expense       - Registrar un gasto/egreso
 *   GET    /cash/summary/:date - Resumen diario de caja por fecha
 *   DELETE /cash/entries/:id   - Eliminar un movimiento de caja
 *
 * Todos los endpoints requieren autenticación JWT y operan
 * dentro del alcance del negocio del usuario autenticado.
 *
 * Tabla(s) relacionada(s): CashEntry
 * Módulo: Caja (cash)
 * ============================================================
 */

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

/**
 * Registra las rutas de gestión de caja en la instancia de Fastify.
 *
 * @param server - Instancia del servidor Fastify
 * @param opts - Opciones que incluyen el middleware de autenticación
 */
export async function cashRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  // ── GET /cash/entries ─────────────────────────────────────
  // Lista todos los movimientos de caja del negocio.
  // Acepta filtros opcionales por rango de fechas (startDate, endDate)
  // como parámetros de query string.
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

      // Convierte las fechas de string a Date si se proporcionan
      return CashService.listEntries(
        user.businessId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    }
  );

  // ── GET /cash/entries/:id ─────────────────────────────────
  // Obtiene un movimiento de caja específico por su ID.
  // Devuelve 404 si no se encuentra la entrada.
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

  // ── POST /cash/entries ────────────────────────────────────
  // Registra un nuevo movimiento de caja genérico.
  // Acepta tipo (INCOME, EXPENSE, OPENING, CLOSING), monto,
  // opcionalmente un orderId asociado y una nota descriptiva.
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

      // Registra el movimiento asociado al negocio y usuario autenticado
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

  // ── POST /cash/open ───────────────────────────────────────
  // Realiza la apertura de caja del día.
  // Registra el monto inicial con el que se abre la caja registradora.
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

  // ── POST /cash/close ──────────────────────────────────────
  // Realiza el cierre de caja del día.
  // Registra el monto final contado al cerrar la caja registradora.
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

  // ── POST /cash/expense ────────────────────────────────────
  // Registra un gasto (egreso) de caja.
  // Útil para registrar compras menores, propinas u otros gastos operativos.
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

  // ── GET /cash/summary/:date ───────────────────────────────
  // Obtiene el resumen diario de caja para una fecha específica.
  // Incluye totales de ingresos, egresos, apertura y cierre del día.
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

      // Convierte la fecha de string a Date para la consulta
      const summary = await CashService.getDailySummary(user.businessId, new Date(date));

      return reply.send(summary);
    }
  );

  // ── DELETE /cash/entries/:id ──────────────────────────────
  // Elimina un movimiento de caja de forma permanente.
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
