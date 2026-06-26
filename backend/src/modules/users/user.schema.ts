/**
 * ============================================================
 * user.schema.ts
 * ============================================================
 * Esquemas de validación (Zod/Fastify) para los endpoints de la API.
 * Módulo: Backend / users
 * ============================================================
 */
export const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string' },
    isActive: { type: 'boolean' },
    businessId: { type: 'string' }
  },
  required: ['id', 'email', 'role', 'isActive', 'businessId']
};

export const userListResponseSchema = {
  type: 'array',
  items: userResponseSchema
};

export const createUserBodySchema = {
  type: 'object',
  required: ['email', 'password', 'role'],
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    password: { type: 'string', minLength: 6 },
    role: { type: 'string' }
  }
};

export const updateUserBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    password: { type: 'string', minLength: 6 },
    role: { type: 'string' },
    isActive: { type: 'boolean' }
  }
};
