/**
 * ============================================================
 * Dashboard.tsx
 * ============================================================
 * Página principal del sistema que muestra un resumen ejecutivo
 * de las operaciones del bar/restaurante en los últimos 30 días.
 *
 * Presenta:
 * - Tarjetas KPI: ventas totales, ticket promedio, gastos e ingreso neto
 * - Gráfico de barras con las ventas diarias de los últimos 7 días
 * - Resumen de métricas de caja (apertura, ventas, gastos, ajustes, cierre)
 * - Tabla de los productos más vendidos (top products)
 * - Grilla con el desempeño de cada mesa (pedidos e ingresos)
 *
 * Llamadas a la API:
 * - GET /dashboard → Obtiene todas las métricas consolidadas
 *
 * Tabla(s) relacionada(s): Order, CashEntry, MenuItem, Table (indirectamente, a través del endpoint dashboard)
 * Módulo: Dashboard / Reportes
 * ============================================================
 */
import { useState, useEffect } from 'react';

/**
 * Interfaz que define las métricas de ventas del período.
 * - totalSales: monto total vendido
 * - totalOrders: cantidad de pedidos realizados
 * - averageOrderValue: valor promedio por pedido (ticket promedio)
 */
interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

/**
 * Interfaz que representa las métricas de un producto vendido.
 * Incluye datos del producto, cantidad total vendida, ingresos generados
 * y la cantidad de pedidos en los que apareció.
 */
interface ProductMetric {
  product: { id: string; name: string; price: number };
  totalQuantity: number;
  totalRevenue: number;
  orders: number;
}

/**
 * Interfaz que define las métricas financieras de caja.
 * - totalOpening: suma de todas las aperturas de caja
 * - totalClosing: suma de todos los cierres de caja
 * - totalExpenses: total de gastos registrados
 * - totalSalesRecorded: ventas registradas en caja
 * - totalAdjustments: ajustes manuales (positivos o negativos)
 */
interface CashMetrics {
  totalOpening: number;
  totalClosing: number;
  totalExpenses: number;
  totalSalesRecorded: number;
  totalAdjustments: number;
}

/**
 * Interfaz que representa las métricas de rendimiento de una mesa.
 * - totalOrders: cantidad de pedidos atendidos en la mesa
 * - totalRevenue: ingresos generados por la mesa
 */
interface TableMetric {
  id: string;
  name: string;
  status: string;
  totalOrders: number;
  totalRevenue: number;
}

/**
 * Interfaz principal que agrupa todos los datos del dashboard.
 * Incluye el período consultado, métricas de ventas, productos top,
 * métricas de caja, desempeño de mesas y datos del gráfico diario.
 */
interface DashboardData {
  period: { startDate: string; endDate: string };
  sales: SalesMetrics;
  topProducts: ProductMetric[];
  cash: CashMetrics;
  tables: TableMetric[];
  dailyChart: Array<{ date: string; sales: number; orders: number }>;
}

/** URL base de la API del backend */
const API_URL = 'http://localhost:4000';

/**
 * Componente principal del Dashboard.
 * Renderiza el panel de control con métricas, gráficos y tablas
 * de resumen operativo del local.
 *
 * @returns JSX del dashboard completo
 */
export default function Dashboard() {
  /** Estado que almacena todos los datos del dashboard recibidos de la API */
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  /** Indicador de carga mientras se obtienen los datos de la API */
  const [loading, setLoading] = useState(true);

  /** Mensaje de error si falla la petición al backend */
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect: Se ejecuta una sola vez al montar el componente.
   * Realiza la petición GET /dashboard con el token JWT del usuario
   * para obtener todas las métricas consolidadas.
   */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // Obtener el token JWT almacenado en localStorage para autenticación
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // --- Estados de carga, error y sin datos ---

  /** Pantalla de carga mientras se obtienen los datos */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2F3D46]">
        <div className="text-[#A3B31A] text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  /** Pantalla de error si falló la petición */
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2F3D46]">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  /** Pantalla cuando no hay datos disponibles */
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2F3D46]">
        <div className="text-[#A3B31A] text-xl">No data available</div>
      </div>
    );
  }

  // Desestructurar los datos del dashboard para facilitar el acceso
  const {
    sales,
    topProducts,
    cash,
    tables,
    dailyChart
  } = dashboardData;

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      {/* ===================== Encabezado de la página ===================== */}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#A3B31A] mb-2">Dashboard</h1>
        <p className="text-gray-400">Resumen de operaciones de los últimos 30 días</p>
      </div>

      {/* ===================== Tarjetas KPI principales ===================== */}
      {/* Grilla de 4 tarjetas con indicadores clave de rendimiento */}
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tarjeta: Ventas Totales - monto acumulado de todas las ventas */}
        {/* Total Sales */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Ventas Totales</div>
          <div className="text-3xl font-bold text-[#39FF8B] mb-2">
            ${sales.totalSales.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">{sales.totalOrders} pedidos</div>
        </div>

        {/* Tarjeta: Ticket Promedio - valor promedio de cada pedido */}
        {/* Average Order Value */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Ticket Promedio</div>
          <div className="text-3xl font-bold text-[#39FF8B] mb-2">
            ${sales.averageOrderValue.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">Por pedido</div>
        </div>

        {/* Tarjeta: Gastos - total de egresos registrados en caja */}
        {/* Total Expenses */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Gastos</div>
          <div className="text-3xl font-bold text-red-400 mb-2">
            ${cash.totalExpenses.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">Registrados</div>
        </div>

        {/* Tarjeta: Ingreso Neto - cálculo de ventas menos gastos */}
        {/* Net Income */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Ingreso Neto</div>
          <div className="text-3xl font-bold text-[#39FF8B] mb-2">
            ${(sales.totalSales - cash.totalExpenses).toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">Ingresos - Gastos</div>
        </div>
      </div>

      {/* ===================== Gráficos y Métricas de Caja ===================== */}
      {/* Grilla de 2 columnas: gráfico de ventas diarias y resumen de caja */}
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de barras: Tendencia de ventas por día (últimos 7 días) */}
        {/* Daily Sales Trend */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <h2 className="text-xl font-bold text-[#A3B31A] mb-4">Ventas por Día (Últimos 7 días)</h2>
          <div className="h-64 bg-[#2F3D46] rounded p-4 flex items-end justify-between gap-2">
            {dailyChart.map((point, idx) => {
              const maxSales = Math.max(...dailyChart.map(p => p.sales), 1); // Evita división por cero
              return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                {/* Barra proporcional a las ventas del día respecto al máximo */}
                <div
                  className="w-full bg-[#39FF8B] rounded-t opacity-80 hover:opacity-100 transition"
                  style={{
                    height: `${Math.max(10, (point.sales / maxSales) * 100)}%`
                  }}
                  title={`$${point.sales.toFixed(2)} - ${point.orders} pedidos`}
                />
                {/* Etiqueta del día (últimos 2 caracteres de la fecha) */}
                <div className="text-gray-400 text-xs">{point.date.slice(-2)}</div>
              </div>
            )})}
          </div>
        </div>

        {/* Panel de métricas de caja: apertura, ventas, gastos, ajustes y cierre */}
        {/* Cash Metrics */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <h2 className="text-xl font-bold text-[#A3B31A] mb-4">Caja</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#4a5a67]">
              <span className="text-gray-400">Apertura Total</span>
              <span className="text-[#39FF8B] font-semibold">${cash.totalOpening.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-[#4a5a67]">
              <span className="text-gray-400">Ventas Registradas</span>
              <span className="text-[#39FF8B] font-semibold">${cash.totalSalesRecorded.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-[#4a5a67]">
              <span className="text-gray-400">Gastos</span>
              <span className="text-red-400 font-semibold">-${cash.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-[#4a5a67]">
              <span className="text-gray-400">Ajustes</span>
              <span className="text-yellow-400 font-semibold">${cash.totalAdjustments.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-300 font-semibold">Cierre Total</span>
              <span className="text-[#A3B31A] font-bold text-lg">${cash.totalClosing.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Tabla de Productos Más Vendidos ===================== */}
      {/* Ranking de productos ordenados por cantidad vendida */}
      {/* Top Products */}
      <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A] mb-8">
        <h2 className="text-xl font-bold text-[#A3B31A] mb-4">Productos Más Vendidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#4a5a67]">
                <th className="text-left py-3 px-4 text-gray-400">Producto</th>
                <th className="text-center py-3 px-4 text-gray-400">Cantidad</th>
                <th className="text-right py-3 px-4 text-gray-400">Ingresos</th>
                <th className="text-center py-3 px-4 text-gray-400">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.product.id} className="border-b border-[#4a5a67] hover:bg-[#4a5a67] transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{product.product.name}</div>
                    <div className="text-xs text-gray-400">${product.product.price.toFixed(2)} c/u</div>
                  </td>
                  <td className="py-3 px-4 text-center text-[#39FF8B]">{product.totalQuantity}</td>
                  <td className="py-3 px-4 text-right font-semibold text-[#39FF8B]">
                    ${product.totalRevenue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">{product.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== Desempeño de Mesas ===================== */}
      {/* Grilla de tarjetas con estadísticas de cada mesa del local */}
      {/* Table Performance */}
      <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
        <h2 className="text-xl font-bold text-[#A3B31A] mb-4">Desempeño de Mesas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="bg-[#2F3D46] rounded p-4 border border-[#4a5a67]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-white">{table.name}</div>
                  <div className="text-xs text-gray-400">
                    Estado: <span className="text-[#39FF8B]">{table.status}</span>
                  </div>
                </div>
              </div>
              {/* Estadísticas de la mesa: pedidos atendidos e ingresos generados */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-400">Pedidos</div>
                  <div className="text-[#A3B31A] font-bold">{table.totalOrders}</div>
                </div>
                <div>
                  <div className="text-gray-400">Ingresos</div>
                  <div className="text-[#39FF8B] font-bold">${table.totalRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
