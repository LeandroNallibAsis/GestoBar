import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { config } from './config';
import { prisma } from './prisma';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { tableRoutes } from './modules/tables/table.routes';
import { salonRoutes } from './modules/salon/salon.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { productRoutes } from './modules/inventory/product.routes';
import { categoryRoutes } from './modules/inventory/category.routes';
import { cashRoutes } from './modules/cash/cash.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';

// Create Fastify server with logger enabled for development and debugging.
const server = Fastify({ logger: true });

// Register CORS and JWT plugins before any routes.
server.register(cors, {
  origin: true
});

server.register(fastifyJwt, {
  secret: config.jwtSecret
});

const authenticate = async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
};

// Simple health route to verify the API and the database connection.
server.get('/', async () => {
  const dbStatus = await prisma.$queryRaw`SELECT 1 as status`;
  return {
    status: 'ok',
    message: 'GestoBar backend is running',
    dbStatus
  };
});

// Register modules with routes.
server.register(authRoutes, { authenticate });
server.register(userRoutes, { authenticate });
server.register(tableRoutes, { authenticate });
server.register(salonRoutes, { authenticate });
server.register(orderRoutes, { authenticate });
server.register(productRoutes, { authenticate });
server.register(categoryRoutes, { authenticate });
server.register(cashRoutes, { authenticate });
server.register(dashboardRoutes, { authenticate });

// Start function encapsulates server bootstrap logic.
const start = async () => {
  try {
    await server.listen({ port: config.port, host: config.host });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

void start();
