import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirigir automáticamente si ya está logueado
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

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
      <div className="max-w-md w-full bg-[#3a4d59] rounded-lg shadow-xl border border-[#A3B31A] p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-2">GestoBar</h1>
          <p className="text-gray-400">Acceso al Sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#4a5a67] text-center">
          <p className="text-gray-500 text-xs">
            Utiliza las credenciales de administrador (admin@gestobar.com / admin123).
          </p>
        </div>
      </div>
    </div>
  );
}