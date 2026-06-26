/**
 * ============================================================
 * INDEX.TS (Punto de entrada del servidor)
 * ============================================================
 * Archivo principal de la aplicación backend de GestoBar.
 * Configura e inicializa el servidor Fastify con todos sus
 * plugins (CORS, JWT) y registra las rutas de cada módulo.
 *
 * Responsabilidades:
 * - Crear la instancia del servidor Fastify
 * - Configurar CORS para permitir peticiones del frontend
 * - Configurar JWT para autenticación con tokens
 * - Definir el middleware de autenticación global
 * - Registrar todas las rutas de los módulos del sistema
 * - Iniciar el servidor en el puerto configurado
 *
 * Tabla(s) relacionada(s): Ninguna directamente (orquestación)
 * Módulo: Core / Bootstrap
 * ============================================================
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { config } from './config';
import { prisma } from './prisma';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { userPermissionRoutes } from './modules/users/user-permission.routes';
import { tableRoutes } from './modules/tables/table.routes';
import { salonRoutes } from './modules/salon/salon.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { MenuItemRoutes } from './modules/inventory/menu-item.routes';
import { InventoryItemRoutes } from './modules/inventory/inventory-item.routes';
import { categoryRoutes } from './modules/inventory/category.routes';
import { cashRoutes } from './modules/cash/cash.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';

// Create Fastify server with logger enabled for development and debugging.
// Crea la instancia del servidor Fastify con logging habilitado
const server = Fastify({ logger: true });

// Register CORS and JWT plugins before any routes.
// Registra CORS permitiendo todas las origenes (origin: true)
// Esto es necesario para que el frontend React pueda comunicarse con el API
server.register(cors, {
  origin: true
});

// Registra el plugin JWT usando el secreto definido en la configuración
// Este plugin agrega los métodos jwtSign y jwtVerify a los objetos request/reply
server.register(fastifyJwt, {
  secret: config.jwtSecret
});

/**
 * Middleware de autenticación.
 * Verifica que el request incluya un token JWT válido.
 * Si el token es inválido o no existe, responde con 401 Unauthorized.
 * Se pasa como opción a cada módulo de rutas para proteger endpoints.
 *
 * @param request - Objeto de petición de Fastify
 * @param reply - Objeto de respuesta de Fastify
 */
const authenticate = async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
};

// Simple health route to verify the API and the database connection.
// Ruta de salud (health check) - verifica que el servidor y la BD estén operativos
// GET / → Retorna estado del servidor y resultado de query de prueba a la BD
server.get('/', async () => {
  const dbStatus = await prisma.$queryRaw`SELECT 1 as status`;
  return {
    status: 'ok',
    message: 'GestoBar backend is running',
    dbStatus
  };
});

// ============================================================
// REGISTRO DE MÓDULOS DE RUTAS
// ============================================================
// Cada módulo recibe la función authenticate como opción
// para poder proteger sus endpoints individuales.

// Register modules with routes.
server.register(authRoutes, { authenticate });              // Autenticación (login/registro)
server.register(userRoutes, { authenticate });               // Gestión de usuarios
server.register(userPermissionRoutes, { authenticate });     // Permisos por usuario
server.register(tableRoutes, { authenticate });              // Gestión de mesas
server.register(salonRoutes, { authenticate });              // Layout del salón
server.register(orderRoutes, { authenticate });              // Pedidos
server.register(MenuItemRoutes, { authenticate });           // Productos del menú
server.register(InventoryItemRoutes, { authenticate });      // Inventario/stock
server.register(categoryRoutes, { authenticate });           // Categorías
server.register(cashRoutes, { authenticate });               // Caja registradora
server.register(dashboardRoutes, { authenticate });          // Dashboard/reportes

/**
 * Función de inicio del servidor.
 * Intenta iniciar el servidor en el host y puerto configurados.
 * Si falla, registra el error y termina el proceso.
 */
// Start function encapsulates server bootstrap logic.
const start = async () => {
  try {
    await server.listen({ port: config.port, host: config.host });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

// Inicia el servidor (void para ignorar la promesa no manejada)
void start();
