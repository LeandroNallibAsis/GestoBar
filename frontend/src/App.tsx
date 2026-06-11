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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pedidos" element={<OrdersPage />} />
            <Route path="/mesas" element={<TableManagement />} />
            <Route path="/inventario" element={<InventoryPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/caja" element={<CashBookPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
        </Route>

        {/* Redirecciones por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}