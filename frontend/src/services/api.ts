/**
 * ============================================================
 * api.ts
 * ============================================================
 * Servicio centralizado de comunicación con el backend (API REST).
 * Proporciona la configuración base de la URL del servidor, la
 * generación automática de cabeceras de autenticación JWT, y una
 * función genérica (apiFetch) para realizar peticiones HTTP.
 *
 * Funcionamiento del cliente API:
 *  1. API_URL define la dirección base del servidor Fastify (backend).
 *  2. authHeaders() lee el token JWT almacenado en localStorage y
 *     construye las cabeceras necesarias (Content-Type + Authorization).
 *  3. apiFetch<T>() es un wrapper sobre fetch() que:
 *     - Adjunta automáticamente las cabeceras de autenticación.
 *     - Permite combinar opciones adicionales de fetch (método, body, etc.).
 *     - Maneja errores HTTP extrayendo el mensaje del servidor.
 *     - Retorna null para respuestas 204 (sin contenido).
 *     - Parsea y retorna el JSON de la respuesta como tipo genérico T.
 *
 * Todos los módulos del frontend (páginas, componentes, hooks) importan
 * estas utilidades para comunicarse con el backend de forma consistente.
 *
 * Módulo: Servicios / Cliente HTTP (Frontend)
 * ============================================================
 */

// Centralized API configuration.
// All modules import API_URL from here to avoid hardcoded ports.
/** URL base del servidor backend Fastify. Todos los endpoints se construyen a partir de esta URL. */
export const API_URL = 'http://localhost:4000';

/**
 * Genera las cabeceras HTTP necesarias para peticiones autenticadas.
 * Lee el token JWT desde localStorage (almacenado durante el login)
 * y lo incluye en la cabecera "Authorization" con el esquema Bearer.
 *
 * @returns Un objeto HeadersInit con Content-Type (JSON) y el token Bearer.
 */
// Returns the Authorization header with the stored JWT token.
export function authHeaders(): HeadersInit {
  // Recuperar el token JWT guardado en el navegador tras el inicio de sesión
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

/**
 * Función genérica para realizar peticiones a la API del backend.
 * Envuelve la función nativa fetch() añadiendo autenticación automática
 * y manejo de errores centralizado.
 *
 * @template T - Tipo esperado de la respuesta JSON (inferido por el contexto de uso).
 * @param path - Ruta relativa del endpoint (ej. "/api/orders", "/api/menu/items").
 * @param options - Opciones adicionales de fetch (method, body, headers extra, etc.).
 * @returns Una promesa que resuelve con los datos parseados del tipo T.
 * @throws Error con el mensaje del servidor si la respuesta no es exitosa (status >= 400).
 *
 * Flujo de ejecución:
 *  1. Construye la URL completa concatenando API_URL + path.
 *  2. Fusiona las cabeceras de autenticación con cualquier cabecera adicional.
 *  3. Verifica si la respuesta fue exitosa (response.ok).
 *  4. Si hubo error, intenta extraer el mensaje del cuerpo JSON del error.
 *  5. Si el status es 204, retorna null (respuestas sin contenido, ej. DELETE exitoso).
 *  6. Si todo es correcto, parsea y retorna el JSON de la respuesta.
 */
// Generic API call helper with error handling.
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Realizar la petición HTTP combinando la URL base con la ruta del endpoint
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    // Fusionar cabeceras de autenticación con cabeceras personalizadas (si las hay)
    headers: { ...authHeaders(), ...(options?.headers ?? {}) }
  });

  // Verificar si la respuesta indica un error HTTP (4xx o 5xx)
  if (!response.ok) {
    // Intentar extraer el mensaje de error del cuerpo JSON de la respuesta
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `Error ${response.status}`);
  }

  // Return null for 204 No Content responses
  // Las respuestas 204 no tienen cuerpo (ej. operaciones DELETE exitosas)
  if (response.status === 204) return null as T;

  // Parsear y retornar el cuerpo JSON de la respuesta como tipo T
  return response.json();
}
