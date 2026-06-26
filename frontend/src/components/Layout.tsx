/**
 * ============================================================
 * Layout.tsx
 * ============================================================
 * Componente de diseño principal (layout) de la aplicación GestoBar.
 * Define la estructura visual que envuelve todas las páginas protegidas:
 *  - A la izquierda: la barra lateral de navegación (Sidebar).
 *  - A la derecha: el contenido dinámico de la página actual (Outlet).
 *
 * Este componente se usa como ruta padre en App.tsx, de modo que
 * todas las rutas hijas (Dashboard, Pedidos, Mesas, etc.) se renderizan
 * dentro del <Outlet> manteniendo la Sidebar visible en todo momento.
 *
 * Utiliza Tailwind CSS con un diseño flex horizontal (sidebar + contenido)
 * y un fondo oscuro (#2F3D46) que ocupa como mínimo toda la altura
 * de la ventana del navegador (min-h-screen).
 *
 * Módulo: Componentes compartidos (Frontend)
 * ============================================================
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Componente Layout — estructura principal de la interfaz.
 * Renderiza la barra lateral fija a la izquierda y el contenido
 * de la página activa a la derecha usando React Router <Outlet>.
 *
 * @returns Un contenedor flex con Sidebar + área de contenido principal.
 */
export default function Layout() {
  return (
    /* Contenedor principal: diseño flex horizontal con fondo oscuro */
    <div className="flex bg-[#2F3D46] min-h-screen">
      {/* Barra lateral de navegación — siempre visible en rutas protegidas */}
      <Sidebar />
      {/* Área principal donde se renderiza la página activa según la ruta */}
      <main className="flex-1">
        {/* Outlet de React Router — aquí se inyecta el componente de la ruta hija */}
        <Outlet />
      </main>
    </div>
  );
}