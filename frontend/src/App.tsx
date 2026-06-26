/**
 * ============================================================
 * App.tsx
 * ============================================================
 * Componente raíz de la aplicación GestoBar.
 * Define el sistema de enrutamiento completo usando React Router v6.
 *
 * Estructura de rutas:
 *  - Rutas públicas: accesibles sin autenticación (ej. /login).
 *  - Rutas protegidas: requieren un token JWT válido en localStorage.
 *    Se envuelven con <ProtectedRoute> que valida la sesión y
 *    <Layout> que proporciona la barra lateral y la estructura visual.
 *  - Redirecciones por defecto: cualquier ruta no reconocida o la
 *    raíz "/" redirigen automáticamente al Dashboard.
 *
 * Módulo: Enrutamiento principal (Frontend)
 * ============================================================
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import MenuPage from './pages/MenuPage';
import TableManagement from './pages/TableManagement';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import CashBookPage from './pages/CashBookPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * Componente principal de la aplicación.
 * Configura el enrutador (BrowserRouter) y declara todas las rutas
 * disponibles organizadas en públicas, protegidas y redirecciones.
 * @returns El árbol de rutas de la aplicación envuelto en un Router.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas — accesibles sin autenticación */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas — requieren JWT válido para acceder */}
        <Route element={<ProtectedRoute />}>
          {/* Layout envuelve todas las páginas con la barra lateral */}
          <Route element={<Layout />}>
            {/* Página principal con métricas y resumen del negocio */}
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Gestión de pedidos del bar/restaurante */}
            <Route path="/pedidos" element={<OrdersPage />} />
            {/* Administración de mesas y salones */}
            <Route path="/mesas" element={<TableManagement />} />
            {/* Gestión del inventario de productos e insumos */}
            <Route path="/inventario" element={<InventoryPage />} />
            {/* Configuración del menú con ítems y categorías */}
            <Route path="/menu" element={<MenuPage />} />
            {/* Libro de caja — registro de movimientos financieros */}
            <Route path="/caja" element={<CashBookPage />} />
            {/* Administración de usuarios (solo roles autorizados) */}
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
        </Route>

        {/* Redirecciones por defecto — cualquier ruta no definida va al Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}