export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 }
  }
};

export const loginResponseSchema = {
  type: 'object',
  properties: {
    token: { type: 'string' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        businessId: { type: 'string' }
      },
      required: ['id', 'email', 'role', 'businessId']
    }
  },
  required: ['token', 'user']
};

export const createPermissionBodySchema = {
  type: 'object',
  required: ['key'],
  properties: {
    key: { type: 'string' },
    description: { type: 'string' }
  }
};

export const assignPermissionsBodySchema = {
  type: 'object',
  required: ['permissionKeys'],
  properties: {
    permissionKeys: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

export const permissionResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    key: { type: 'string' },
    description: { type: 'string' }
  },
  required: ['id', 'key']
};

export const permissionListResponseSchema = {
  type: 'array',
  items: permissionResponseSchema
};

export const assignPermissionsParamsSchema = {
  type: 'object',
  required: ['role'],
  properties: {
    role: { type: 'string' }
  }
};
