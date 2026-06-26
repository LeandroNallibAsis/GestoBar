/**
 * ============================================================
 * Login.tsx
 * ============================================================
 * Página de inicio de sesión del sistema GestoBar.
 * Permite al usuario autenticarse mediante email y contraseña.
 *
 * Flujo:
 * 1. Si el usuario ya tiene un token JWT válido en localStorage,
 *    se redirige automáticamente al dashboard.
 * 2. El usuario ingresa sus credenciales y envía el formulario.
 * 3. Se realiza un POST a /auth/login con email y contraseña.
 * 4. Si la autenticación es exitosa, se almacena el token JWT
 *    y los datos del usuario en localStorage, y se redirige al dashboard.
 * 5. Si falla, se muestra un mensaje de error.
 *
 * Llamadas a la API:
 * - POST /auth/login → Autenticación del usuario
 *
 * Tabla(s) relacionada(s): User (indirectamente, a través del endpoint de auth)
 * Módulo: Autenticación
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** URL base de la API del backend */
const API_URL = 'http://localhost:4000';

/**
 * Componente de la página de Login.
 * Renderiza un formulario centrado con campos de email y contraseña,
 * y maneja el proceso completo de autenticación.
 *
 * @returns JSX del formulario de inicio de sesión
 */
export default function Login() {
  /** Hook de navegación de React Router para redireccionar al usuario */
  const navigate = useNavigate();

  /** Estado que almacena el email ingresado por el usuario */
  const [email, setEmail] = useState('');

  /** Estado que almacena la contraseña ingresada por el usuario */
  const [password, setPassword] = useState('');

  /** Mensaje de error mostrado al usuario cuando falla la autenticación */
  const [error, setError] = useState<string | null>(null);

  /** Indicador de carga mientras se procesa la petición de login */
  const [loading, setLoading] = useState(false);

  /**
   * useEffect: Se ejecuta al montar el componente y cuando cambia 'navigate'.
   * Verifica si ya existe un token JWT almacenado en localStorage.
   * Si existe, redirige automáticamente al dashboard (el usuario ya está logueado).
   */
  // Redirigir automáticamente si ya está logueado
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  /**
   * Manejador del envío del formulario de login.
   * Realiza la petición POST /auth/login con las credenciales del usuario.
   * Si es exitoso, almacena el token y datos del usuario en localStorage
   * y redirige al dashboard. Si falla, muestra el mensaje de error.
   *
   * @param e - Evento del formulario (se previene el comportamiento por defecto)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Se normaliza el email a minúsculas y se eliminan espacios
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Almacenar el token JWT y los datos del usuario en localStorage
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2F3D46] flex items-center justify-center p-4">
      {/* ===================== Tarjeta principal del formulario ===================== */}
      <div className="max-w-md w-full bg-[#3a4d59] rounded-lg shadow-xl border border-[#A3B31A] p-8">
        {/* Encabezado con el nombre del sistema */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-2">GestoBar</h1>
          <p className="text-gray-400">Acceso al Sistema</p>
        </div>

        {/* ===================== Formulario de login ===================== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensaje de error condicional */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          {/* Campo de correo electrónico */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded p-3 text-white focus:outline-none focus:border-[#A3B31A] transition"
              placeholder="admin@gestobar.com"
            />
          </div>

          {/* Campo de contraseña */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded p-3 text-white focus:outline-none focus:border-[#A3B31A] transition"
              placeholder="••••••••"
            />
          </div>

          {/* Botón de envío - se deshabilita mientras se procesa la solicitud */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        {/* Pie de página con credenciales de ejemplo para desarrollo */}
        <div className="mt-8 pt-6 border-t border-[#4a5a67] text-center">
          <p className="text-gray-500 text-xs">
            Utiliza las credenciales de administrador (admin@gestobar.com / admin123).
          </p>
        </div>
      </div>
    </div>
  );
}