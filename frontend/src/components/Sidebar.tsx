import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canManageUsers = user?.role === 'SuperAdmin' || user?.role === 'BusinessOwner';

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Pedidos', path: '/pedidos', icon: '📋' },
    { name: 'Salón y Mesas', path: '/mesas', icon: '🪑' },
    { name: 'Menú', path: '/menu', icon: '🍔' },
    { name: 'Inventario', path: '/inventario', icon: '📦' },
    { name: 'Libro de Caja', path: '/caja', icon: '💰' },
    ...(canManageUsers ? [{ name: 'Usuarios', path: '/usuarios', icon: '👥' }] : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#3a4d59] min-h-screen border-r border-[#4a5a67] flex flex-col sticky top-0">
      <div className="p-6 border-b border-[#4a5a67]">
        <h1 className="text-2xl font-bold text-[#A3B31A]">GestoBar</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition duration-200 ${
              location.pathname.startsWith(item.path)
                ? 'bg-[#A3B31A] text-[#2F3D46] font-bold shadow-lg shadow-[#A3B31A]/20'
                : 'text-gray-300 hover:bg-[#2F3D46] hover:text-[#A3B31A]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
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