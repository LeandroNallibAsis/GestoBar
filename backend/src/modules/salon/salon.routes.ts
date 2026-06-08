import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { SalonService } from './salon.service';
import { JwtUser } from '../auth/auth.types';
import { saveSalonLayoutBodySchema, salonLayoutResponseSchema } from './salon.schema';

// Register salon layout routes for the visual salon editor.
export async function salonRoutes(server: FastifyInstance, opts: { authenticate: any }) {
  const authenticate = opts.authenticate;

  server.get(
    '/salon/layout',
    {
      preValidation: [authenticate],
      schema: {
        response: {
          200: salonLayoutResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const layout = await SalonService.getLayout(user.businessId);
      if (!layout) {
        return reply.status(404).send({ message: 'Layout not found' });
      }
      return layout;
    }
  );

  server.post(
    '/salon/layout',
    {
      preValidation: [authenticate],
      schema: {
        body: saveSalonLayoutBodySchema,
        response: {
          200: salonLayoutResponseSchema
        }
      }
    },
    async (request) => {
      const user = request.user as JwtUser;
      const { rows, columns, areas } = request.body as {
        rows: number;
        columns: number;
        areas: Array<{ name: string; color: string; cells: Prisma.JsonArray }>;
      };
      return SalonService.saveLayout(user.businessId, rows, columns, areas);
    }
  );
}
