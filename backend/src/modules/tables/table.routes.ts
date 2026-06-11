import type { FastifyInstance } from 'fastify';
import { TableService } from './table.service';
import { JwtUser } from '../auth/auth.types';
import {
  createTableBodySchema,
  tableListResponseSchema,
  tableResponseSchema,
  updateTableBodySchema
} from './table.schema';

const canManageTables = (role: string) => {
  return ['SuperAdmin', 'BusinessOwner', 'Manager'].includes(role);
};

// Register table management routes for business-scoped tables.
export async function tableRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.get(
    '/tables',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: tableListResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      return TableService.listTables(user.businessId);
    }
  );

  server.get(
    '/tables/:id',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: tableResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { id } = request.params as { id: string };
      const table = await TableService.getTableById(id, user.businessId);
      if (!table) {
        return reply.status(404).send({ message: 'Table not found' });
      }
      return table;
    }
  );

  server.post(
    '/tables',
    {
      preValidation: [authenticate],
      schema: {
        body: createTableBodySchema,
        response: {
          200: tableResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!canManageTables(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { name, capacity, linkedTableId, status } = request.body as { name: string; capacity?: number; linkedTableId?: string; status: string };
      const table = await TableService.createTable({
        name,
        capacity,
        linkedTableId,
        status: status as any,
        businessId: user.businessId
      });
      return reply.send(table);
    }
  );

  server.patch(
    '/tables/:id',
    {
      preValidation: [authenticate],
      schema: {
        body: updateTableBodySchema,
        response: {
          200: tableResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!canManageTables(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      const data = request.body as { name?: string; capacity?: number; linkedTableId?: string | null; status?: string };
      const updated = await TableService.updateTable(id, user.businessId, {
        name: data.name,
        capacity: data.capacity,
        linkedTableId: data.linkedTableId,
        status: data.status as any
      });
      return reply.send(updated);
    }
  );

  server.delete(
    '/tables/:id',
    {
      preValidation: [authenticate]
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      if (!canManageTables(user.role)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      await TableService.deleteTable(id, user.businessId);
      return reply.send({ success: true });
    }
  );
}
