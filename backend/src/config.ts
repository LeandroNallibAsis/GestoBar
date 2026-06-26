/**
 * ============================================================
 * CONFIG.TS
 * ============================================================
 * Archivo de configuración centralizada del backend.
 * Carga las variables de entorno desde el archivo .env y las
 * expone como un objeto tipado para uso en toda la aplicación.
 *
 * Variables requeridas:
 * - DATABASE_URL: URL de conexión a PostgreSQL
 * - JWT_SECRET: Secreto para firmar tokens JWT
 *
 * Variables opcionales (con valores por defecto):
 * - PORT: Puerto del servidor (default: 4000)
 * - HOST: Host de escucha (default: '0.0.0.0')
 *
 * Tabla(s) relacionada(s): Ninguna
 * Módulo: Core / Configuración
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env in development.
// Carga las variables de entorno desde el archivo .env ubicado en la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Objeto de configuración global de la aplicación.
 * Centraliza todos los valores de configuración con valores por defecto seguros.
 * Se utiliza en todo el backend para acceder a la configuración.
 */
export const config = {
  port: Number(process.env.PORT ?? 4000),               // Puerto del servidor HTTP
  host: process.env.HOST ?? '0.0.0.0',                  // Host de escucha (0.0.0.0 = todas las interfaces)
  jwtSecret: process.env.JWT_SECRET ?? 'change_this_secret', // Secreto para firmar tokens JWT
  databaseUrl: process.env.DATABASE_URL ?? ''            // URL de conexión a PostgreSQL
};

// Validación obligatoria: la aplicación no puede funcionar sin URL de base de datos
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required in environment variables');
}

// Validación obligatoria: la aplicación no puede funcionar sin secreto JWT
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is required in environment variables');
}
