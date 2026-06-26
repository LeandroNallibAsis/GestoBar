/**
 * ============================================================
 * PRISMA.TS
 * ============================================================
 * Instancia singleton del cliente Prisma para acceso a la base
 * de datos. Se exporta una única instancia que es compartida
 * por todos los repositorios del sistema.
 *
 * Usar una sola instancia evita crear múltiples conexiones
 * a la base de datos, lo cual podría agotar el pool de conexiones.
 * Todos los módulos (.repository.ts) importan esta instancia.
 *
 * Tabla(s) relacionada(s): Todas (acceso genérico)
 * Módulo: Core / Base de datos
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';

// Single Prisma client instance for the backend application.
// Instancia única de PrismaClient compartida por toda la aplicación
export const prisma = new PrismaClient();
