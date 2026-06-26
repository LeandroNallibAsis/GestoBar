/**
 * ============================================================
 * AUTH.TYPES.TS
 * ============================================================
 * Tipos TypeScript para el módulo de autenticación.
 * Define las interfaces y tipos utilizados en el flujo de
 * autenticación JWT del sistema.
 *
 * Tabla(s) relacionada(s): User (indirectamente)
 * Módulo: Autenticación (Auth)
 * ============================================================
 */

/**
 * Tipo que representa el payload decodificado de un token JWT.
 * Estos datos se extraen del token en cada petición autenticada
 * y están disponibles en request.user después de jwtVerify().
 *
 * Campos:
 * - sub: ID único del usuario (subject del JWT, corresponde a User.id)
 * - email: Email del usuario autenticado
 * - role: Rol del usuario (SuperAdmin, BusinessOwner, Employee)
 * - businessId: ID del negocio al que pertenece el usuario (multi-tenancy)
 */
export type JwtUser = {
  sub: string;        // Subject: UUID del usuario (User.id)
  email: string;      // Email del usuario autenticado
  role: string;       // Rol del usuario en el sistema
  businessId: string; // ID del negocio (para filtrar datos por tenant)
};
