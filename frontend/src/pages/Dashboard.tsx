import { useState, useEffect } from 'react';

interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface ProductMetric {
  product: { id: string; name: string; price: number };
  totalQuantity: number;
  totalRevenue: number;
  orders: number;
}

interface CashMetrics {
  totalOpening: number;
  totalClosing: number;
  totalExpenses: number;
  totalSalesRecorded: number;
  totalAdjustments: number;
}

interface TableMetric {
  id: string;
  name: string;
  status: string;
  totalOrders: number;
  totalRevenue: number;
}

interface DashboardData {
  period: { startDate: string; endDate: string };
  sales: SalesMetrics;
  topProducts: ProductMetric[];
  cash: CashMetrics;
  tables: TableMetric[];
  dailyChart: Array<{ date: string; sales: number; orders: number }>;
}

const API_URL = 'http://localhost:4000';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2F3D46]">
        <div className="text-[#A3B31A] text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2F3D46]">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2F3D46]">
        <div className="text-[#A3B31A] text-xl">No data available</div>
      </div>
    );
  }

  const {
    sales,
    topProducts,
    cash,
    tables,
    dailyChart
  } = dashboardData;

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#A3B31A] mb-2">Dashboard</h1>
        <p className="text-gray-400">Resumen de operaciones de los últimos 30 días</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sales */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Ventas Totales</div>
          <div className="text-3xl font-bold text-[#39FF8B] mb-2">
            ${sales.totalSales.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">{sales.totalOrders} pedidos</div>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Ticket Promedio</div>
          <div className="text-3xl font-bold text-[#39FF8B] mb-2">
            ${sales.averageOrderValue.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">Por pedido</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Gastos</div>
          <div className="text-3xl font-bold text-red-400 mb-2">
            ${cash.totalExpenses.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">Registrados</div>
        </div>

        {/* Net Income */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <div className="text-gray-400 text-sm font-semibold mb-2">Ingreso Neto</div>
          <div className="text-3xl font-bold text-[#39FF8B] mb-2">
            ${(sales.totalSales - cash.totalExpenses).toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">Ingresos - Gastos</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Sales Trend */}
        <div className="bg-[#3a4d59] rounded-lg p-6 border border-[#A3B31A]">
          <h2 className="text-xl font-bold text-[#A3B31A] mb-4">Ventas por Día (Últimos 7 días)</h2>
          <div className="h-64 bg-[#2F3D46] rounded p-4 flex items-end justify-between gap-2">
            {dailyChart.map((point, idx) => {
              const maxSales = Math.max(...dailyChart.map(p => p.sales), 1); // Evita división por cero
              return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full bg-[#39FF8B] rounded-t opacity-80 hover:opacity-100 transition"
                  style={{
                    height: `${Math.max(10, (point.sales / maxSales) * 100)}%`
                  }}
                  title={`$${point.sales.toFixed(2)} - ${point.orders} pedidos`}
                />
                <div className="text-gray-400 text-xs">{point.date.slice(-2)}</div>
              </div>
            )})}
          </div>
        </div>

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
