// Centralized API configuration.
// All modules import API_URL from here to avoid hardcoded ports.
export const API_URL = 'http://localhost:4000';

// Returns the Authorization header with the stored JWT token.
export function authHeaders(): HeadersInit {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// Generic API call helper with error handling.
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers ?? {}) }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `Error ${response.status}`);
  }

  // Return null for 204 No Content responses
  if (response.status === 204) return null as T;

  return response.json();
}
