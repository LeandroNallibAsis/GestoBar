/**
 * ============================================================
 * Sidebar.tsx
 * ============================================================
 * Componente de barra lateral de navegación principal de GestoBar.
 * Se muestra permanentemente en todas las páginas protegidas (dentro
 * del Layout) y proporciona:
 *
 *  - Logo/nombre de la aplicación ("GestoBar") en la parte superior.
 *  - Menú de navegación con enlaces a cada sección del sistema:
 *    Dashboard, Pedidos, Salón y Mesas, Menú, Inventario, Libro de Caja.
 *  - Enlace condicional a "Usuarios" (solo visible para roles
 *    SuperAdmin y BusinessOwner).
 *  - Botón de "Cerrar Sesión" en la parte inferior que limpia el
 *    almacenamiento local y redirige al login.
 *
 * La ruta activa se resalta visualmente con un fondo verde (#A3B31A)
 * usando useLocation() de React Router para detectar la URL actual.
 *
 * Módulo: Componentes de navegación (Frontend)
 * ============================================================
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Interfaz que define la estructura de un elemento del menú de navegación.
 * @property name - Texto visible del enlace (ej. "Dashboard", "Pedidos").
 * @property path - Ruta a la que navega el enlace (ej. "/dashboard").
 * @property icon - Emoji que se muestra como ícono del enlace.
 */
interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

/**
 * Componente Sidebar — barra lateral de navegación.
 * Renderiza el menú principal de la aplicación con enlaces a todas
 * las secciones, control de acceso por rol para la sección de Usuarios,
 * y un botón de cierre de sesión.
 *
 * @returns La barra lateral completa con logo, navegación y logout.
 */
export default function Sidebar() {
  // Hook para obtener la ruta actual y resaltar el enlace activo
  const location = useLocation();
  // Hook para navegación programática (usado en logout)
  const navigate = useNavigate();

  // Recuperar los datos del usuario logueado desde localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  // Solo los roles SuperAdmin y BusinessOwner pueden gestionar usuarios
  const canManageUsers = user?.role === 'SuperAdmin' || user?.role === 'BusinessOwner';

  /**
   * Lista de elementos del menú de navegación.
   * Cada elemento define el nombre visible, la ruta y el ícono emoji.
   * El enlace de "Usuarios" se incluye condicionalmente según el rol del usuario.
   */
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Pedidos', path: '/pedidos', icon: '📋' },
    { name: 'Salón y Mesas', path: '/mesas', icon: '🪑' },
    { name: 'Menú', path: '/menu', icon: '🍔' },
    { name: 'Inventario', path: '/inventario', icon: '📦' },
    { name: 'Libro de Caja', path: '/caja', icon: '💰' },
    // Agregar enlace de Usuarios solo si el rol del usuario lo permite
    ...(canManageUsers ? [{ name: 'Usuarios', path: '/usuarios', icon: '👥' }] : []),
  ];

  /**
   * Manejador de cierre de sesión.
   * Elimina el token JWT y los datos del usuario del almacenamiento local,
   * y redirige al usuario a la página de login.
   */
  const handleLogout = () => {
    // Limpiar datos de autenticación del navegador
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    // Redirigir a la página de inicio de sesión
    navigate('/login');
  };

  return (
    /* Contenedor principal de la sidebar: ancho fijo, fondo oscuro, altura completa */
    <div className="w-64 bg-[#3a4d59] min-h-screen border-r border-[#4a5a67] flex flex-col sticky top-0">
      {/* Sección superior: logo y nombre de la aplicación */}
      <div className="p-6 border-b border-[#4a5a67]">
        <h1 className="text-2xl font-bold text-[#A3B31A]">GestoBar</h1>
      </div>
      {/* Sección de navegación: lista de enlaces a cada módulo del sistema */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            /* Estilo condicional: resaltar con fondo verde si la ruta actual coincide */
            className={`flex items-center space-x-3 p-3 rounded-lg transition duration-200 ${
              location.pathname.startsWith(item.path)
                ? 'bg-[#A3B31A] text-[#2F3D46] font-bold shadow-lg shadow-[#A3B31A]/20'
                : 'text-gray-300 hover:bg-[#2F3D46] hover:text-[#A3B31A]'
            }`}
          >
            {/* Ícono emoji del elemento de menú */}
            <span className="text-xl">{item.icon}</span>
            {/* Nombre visible del enlace */}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      {/* Sección inferior: botón de cerrar sesión */}
      <div className="p-4 border-t border-[#4a5a67]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition duration-200"
        >
          <span className="text-xl">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}