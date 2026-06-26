/**
 * ============================================================
 * AUTH.SCHEMA.TS
 * ============================================================
 * Esquemas de validación JSON Schema para el módulo de
 * autenticación y permisos. Define la estructura esperada
 * de los bodies de petición y las respuestas de la API.
 *
 * Fastify utiliza estos esquemas para:
 * - Validar automáticamente los datos de entrada (request body)
 * - Serializar y validar las respuestas (response)
 * - Generar documentación Swagger/OpenAPI automáticamente
 *
 * Tabla(s) relacionada(s): User, Permission, RolePermission
 * Módulo: Autenticación (Auth)
 * ============================================================
 */

/**
 * Esquema del body para la petición de login (POST /auth/login).
 * Requiere email con formato válido y contraseña de mínimo 6 caracteres.
 */
export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },   // Email con formato válido
    password: { type: 'string', minLength: 6 }     // Contraseña mínimo 6 caracteres
  }
};

/**
 * Esquema de respuesta exitosa del login.
 * Retorna el token JWT y los datos básicos del usuario autenticado.
 * El token se usa en el header Authorization de peticiones subsiguientes.
 */
export const loginResponseSchema = {
  type: 'object',
  properties: {
    token: { type: 'string' },   // Token JWT para autenticación
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },         // UUID del usuario
        email: { type: 'string' },       // Email del usuario
        role: { type: 'string' },        // Rol (SuperAdmin, BusinessOwner, Employee)
        businessId: { type: 'string' }   // ID del negocio al que pertenece
      },
      required: ['id', 'email', 'role', 'businessId']
    }
  },
  required: ['token', 'user']
};

/**
 * Esquema del body para crear un nuevo permiso en el sistema.
 * La clave (key) es obligatoria y debe seguir el formato 'modulo:accion'.
 */
export const createPermissionBodySchema = {
  type: 'object',
  required: ['key'],
  properties: {
    key: { type: 'string' },          // Clave única del permiso (ej: 'orders:create')
    description: { type: 'string' }   // Descripción legible (opcional)
  }
};

/**
 * Esquema del body para asignar permisos a un rol.
 * Recibe un array de claves de permisos que se asignarán al rol indicado.
 * Reemplaza los permisos existentes del rol (estrategia de reemplazo total).
 */
export const assignPermissionsBodySchema = {
  type: 'object',
  required: ['permissionKeys'],
  properties: {
    permissionKeys: {
      type: 'array',
      items: { type: 'string' }   // Array de claves de permisos (ej: ['orders:view', 'orders:create'])
    }
  }
};

/**
 * Esquema de respuesta para un permiso individual.
 * Usado para representar un permiso en las respuestas de la API.
 */
export const permissionResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },          // UUID del permiso
    key: { type: 'string' },         // Clave única del permiso
    description: { type: 'string' }  // Descripción del permiso
  },
  required: ['id', 'key']
};

/**
 * Esquema de respuesta para una lista de permisos.
 * Array de objetos que siguen el esquema permissionResponseSchema.
 */
export const permissionListResponseSchema = {
  type: 'array',
  items: permissionResponseSchema
};

/**
 * Esquema de parámetros de ruta para asignar permisos a un rol.
 * Requiere el nombre del rol como parámetro de URL (ej: /permissions/role/:role).
 */
export const assignPermissionsParamsSchema = {
  type: 'object',
  required: ['role'],
  properties: {
    role: { type: 'string' }   // Nombre del rol (SuperAdmin, BusinessOwner, Employee)
  }
};
