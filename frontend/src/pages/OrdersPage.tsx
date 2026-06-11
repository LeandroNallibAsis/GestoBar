import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

type OrderType = 'TABLE' | 'TAKEAWAY' | 'DELIVERY';
type OrderStatus = 'OPEN' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PAID' | 'CANCELLED';

interface MenuItem { id: string; name: string; price: number; category?: { name: string } }
interface Table { id: string; name: string; status: string; capacity: number }
interface OrderItem { id: string; productId: string; quantity: number; price: number; product: MenuItem }
interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  total: number;
  tableId?: string;
  table?: Table;
  deliveryAddress?: string;
  items: OrderItem[];
  waiter?: { id: string; name: string };
  createdAt: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  OPEN: 'Abierto', PREPARING: 'Preparando', READY: 'Listo',
  DELIVERED: 'Entregado', PAID: 'Pagado', CANCELLED: 'Cancelado'
};
const STATUS_COLOR: Record<OrderStatus, string> = {
  OPEN: 'bg-blue-900 text-blue-300', PREPARING: 'bg-yellow-900 text-yellow-300',
  READY: 'bg-green-900 text-green-300', DELIVERED: 'bg-purple-900 text-purple-300',
  PAID: 'bg-gray-700 text-gray-300', CANCELLED: 'bg-red-900 text-red-300'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderType>('TABLE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [error, setError] = useState('');

  // New order form state
  const [newOrder, setNewOrder] = useState<{
    type: OrderType;
    tableId: string;
    deliveryAddress: string;
    items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  }>({ type: 'TABLE', tableId: '', deliveryAddress: '', items: [] });

  const fetchAll = async () => {
    try {
      const [o, m, t] = await Promise.all([
        apiFetch<Order[]>('/orders'),
        apiFetch<MenuItem[]>('/menu-items'),
        apiFetch<Table[]>('/tables')
      ]);
      setOrders(o);
      setMenuItems(m);
      setTables(t);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addProductToOrder = (product: MenuItem) => {
    const existing = newOrder.items.find((i) => i.productId === product.id);
    if (existing) {
      setNewOrder({ ...newOrder, items: newOrder.items.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      )});
    } else {
      setNewOrder({ ...newOrder, items: [...newOrder.items, {
        productId: product.id, name: product.name, price: product.price, quantity: 1
      }]});
    }
  };

  const removeItem = (productId: string) => {
    setNewOrder({ ...newOrder, items: newOrder.items.filter((i) => i.productId !== productId) });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    setNewOrder({ ...newOrder, items: newOrder.items.map((i) =>
      i.productId === productId ? { ...i, quantity: qty } : i
    )});
  };

  const orderTotal = newOrder.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newOrder.items.length === 0) { setError('Agregar al menos un plato/bebida'); return; }
    if (newOrder.type === 'TABLE' && !newOrder.tableId) { setError('Seleccioná una mesa'); return; }

    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          type: newOrder.type,
          tableId: newOrder.tableId || undefined,
          deliveryAddress: newOrder.deliveryAddress || undefined,
          items: newOrder.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
        })
      });
      setIsModalOpen(false);
      setNewOrder({ type: 'TABLE', tableId: '', deliveryAddress: '', items: [] });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Error al crear el pedido');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await apiFetch(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleClose = async (orderId: string) => {
    try {
      await apiFetch(`/orders/${orderId}/close`, { method: 'POST' });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('¿Cancelar este pedido?')) return;
    try {
      await apiFetch(`/orders/${orderId}/cancel`, { method: 'POST' });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const activeOrders = orders.filter((o) =>
    o.type === activeTab && !['PAID', 'CANCELLED'].includes(o.status)
  );
  const filteredProducts = menuItems.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const tabs: { key: OrderType; label: string; icon: string }[] = [
    { key: 'TABLE', label: 'En Mesa', icon: '🍽️' },
    { key: 'TAKEAWAY', label: 'Para Llevar', icon: '🥡' },
    { key: 'DELIVERY', label: 'Delivery', icon: '🛵' }
  ];

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Pedidos</h1>
          <p className="text-gray-400">Gestiona los pedidos activos del local</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setError(''); setNewOrder({ type: activeTab, tableId: '', deliveryAddress: '', items: [] }); }}
          className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
        >
          + Nuevo Pedido
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition ${
              activeTab === tab.key
                ? 'bg-[#A3B31A] text-[#2F3D46]'
                : 'bg-[#3a4d59] text-gray-300 hover:bg-[#4a5a67]'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#2F3D46] text-[#A3B31A]' : 'bg-[#2F3D46] text-gray-400'}`}>
              {orders.filter((o) => o.type === tab.key && !['PAID', 'CANCELLED'].includes(o.status)).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando pedidos...</div>
      ) : activeOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">📋</div>
          <p>No hay pedidos activos en esta sección</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-[#A3B31A] hover:underline">
            Crear un pedido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map((order) => (
            <div key={order.id} className="bg-[#3a4d59] border border-[#4a5a67] rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">
                    {order.type === 'TABLE' ? `Mesa: ${order.table?.name || '?'}` :
                     order.type === 'TAKEAWAY' ? 'Para Llevar' : `Delivery`}
                  </div>
                  {order.deliveryAddress && (
                    <div className="text-xs text-gray-400 mt-0.5">{order.deliveryAddress}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    {order.waiter && ` · ${order.waiter.name}`}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="border-t border-[#4a5a67] pt-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.quantity}x {item.product.name}</span>
                    <span className="text-[#39FF8B]">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-[#4a5a67] pt-3 mt-auto">
                <span className="font-bold text-[#39FF8B] text-lg">${order.total.toLocaleString('es-AR')}</span>
                <div className="flex gap-2">
                  {order.status !== 'DELIVERED' && order.status !== 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status === 'OPEN' ? 'PREPARING' : 'READY')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#A3B31A] text-[#2F3D46] font-semibold hover:bg-[#8e9e16] transition"
                    >
                      {order.status === 'OPEN' ? '▶ Preparar' : '✓ Listo'}
                    </button>
                  )}
                  <button
                    onClick={() => handleClose(order.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-700 text-green-100 font-semibold hover:bg-green-600 transition"
                  >
                    💵 Cobrar
                  </button>
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-900 text-red-300 hover:bg-red-800 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#4a5a67]">
              <h2 className="text-2xl font-bold text-[#A3B31A]">Nuevo Pedido</h2>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left: order form */}
              <form onSubmit={handleSubmitOrder} className="w-1/2 p-5 flex flex-col gap-4 overflow-y-auto border-r border-[#4a5a67]">
                {/* Order type selector */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Tipo de pedido</label>
                  <div className="flex gap-2">
                    {tabs.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setNewOrder({ ...newOrder, type: t.key, tableId: '' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                          newOrder.type === t.key ? 'bg-[#A3B31A] text-[#2F3D46]' : 'bg-[#2F3D46] text-gray-400 hover:bg-[#4a5a67]'
                        }`}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table selector */}
                {newOrder.type === 'TABLE' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Mesa *</label>
                    <select
                      className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                      value={newOrder.tableId}
                      onChange={(e) => setNewOrder({ ...newOrder, tableId: e.target.value })}
                    >
                      <option value="">Seleccionar mesa...</option>
                      {tables.filter((t) => t.status === 'FREE' || t.status === 'OCCUPIED').map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Delivery address */}
                {newOrder.type === 'DELIVERY' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Dirección de entrega</label>
                    <input
                      type="text"
                      className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                      value={newOrder.deliveryAddress}
                      onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
                      placeholder="Ej: Av. Corrientes 1234"
                    />
                  </div>
                )}

                {/* Items list */}
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-2">Productos agregados</label>
                  {newOrder.items.length === 0 ? (
                    <p className="text-gray-600 text-sm italic">Seleccioná productos de la derecha</p>
                  ) : (
                    <div className="space-y-2">
                      {newOrder.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-2 bg-[#2F3D46] rounded-lg p-2">
                          <div className="flex-1 text-sm">{item.name}</div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 rounded bg-[#4a5a67] text-white hover:bg-red-700 transition text-center">−</button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 rounded bg-[#4a5a67] text-white hover:bg-green-700 transition text-center">+</button>
                          </div>
                          <span className="text-[#39FF8B] text-sm font-semibold w-20 text-right">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="border-t border-[#4a5a67] pt-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400">Total</div>
                    <div className="text-2xl font-bold text-[#39FF8B]">${orderTotal.toLocaleString('es-AR')}</div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                      Cancelar
                    </button>
                    <button type="submit" className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-5 rounded-lg hover:bg-[#8e9e16] transition">
                      Confirmar Pedido
                    </button>
                  </div>
                </div>
              </form>

              {/* Right: product selector */}
              <div className="w-1/2 p-5 flex flex-col overflow-y-auto">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none mb-3"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                <div className="space-y-1">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProductToOrder(p)}
                      className="w-full flex justify-between items-center p-2.5 rounded-lg bg-[#2F3D46] hover:bg-[#4a5a67] transition text-left"
                    >
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        {p.category && <div className="text-xs text-gray-500">{p.category.name}</div>}
                      </div>
                      <span className="text-[#39FF8B] text-sm font-semibold">${p.price.toLocaleString('es-AR')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
