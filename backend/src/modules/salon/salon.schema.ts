/**
 * ============================================================
 * salon.schema.ts
 * ============================================================
 * Esquemas de validación (Zod/Fastify) para los endpoints de la API.
 * Módulo: Backend / salon
 * ============================================================
 */
export const salonLayoutResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    businessId: { type: 'string' },
    rows: { type: 'number' },
    columns: { type: 'number' },
    areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          color: { type: 'string' },
          cells: { type: 'array', items: { type: 'object' } }
        },
        required: ['id', 'name', 'color', 'cells']
      }
    }
  },
  required: ['id', 'businessId', 'rows', 'columns', 'areas']
};

export const saveSalonLayoutBodySchema = {
  type: 'object',
  required: ['rows', 'columns', 'areas'],
  properties: {
    rows: { type: 'number', minimum: 3, maximum: 20 },
    columns: { type: 'number', minimum: 3, maximum: 20 },
    areas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'color', 'cells'],
        properties: {
          name: { type: 'string' },
          color: { type: 'string' },
          cells: {
            type: 'array',
            items: {
              type: 'object',
              required: ['x', 'y'],
              properties: {
                x: { type: 'number' },
                y: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }
};
