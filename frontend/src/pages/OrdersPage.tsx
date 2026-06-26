/**
 * ============================================================
 * OrdersPage.tsx
 * ============================================================
 * Página de gestión de pedidos del bar/restaurante.
 * Permite crear, visualizar y administrar los pedidos activos
 * del local, organizados por tipo: en mesa, para llevar o delivery.
 *
 * Funcionalidades:
 * - Listar pedidos activos filtrados por tipo (TABLE, TAKEAWAY, DELIVERY)
 * - Crear nuevos pedidos con selector de productos tipo carrito
 * - Cambiar el estado de un pedido (Abierto → Preparando → Listo)
 * - Cobrar/cerrar un pedido (marcar como PAID)
 * - Cancelar pedidos con confirmación
 * - Búsqueda de productos al crear un pedido
 * - Contadores de pedidos activos por tipo en las pestañas
 *
 * Flujo de estados de un pedido:
 * OPEN → PREPARING → READY → DELIVERED → PAID
 *                                       → CANCELLED
 *
 * Llamadas a la API:
 * - GET /orders → Obtener todos los pedidos
 * - POST /orders → Crear un nuevo pedido con sus ítems
 * - PATCH /orders/:id → Actualizar el estado de un pedido
 * - POST /orders/:id/close → Cerrar/cobrar un pedido
 * - POST /orders/:id/cancel → Cancelar un pedido
 * - GET /menu-items → Obtener productos disponibles para agregar al pedido
 * - GET /tables → Obtener mesas disponibles para pedidos en mesa
 *
 * Tabla(s) relacionada(s): Order, OrderItem, MenuItem, Table
 * Módulo: Pedidos
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

/** Tipos de pedido: en mesa, para llevar o delivery */
type OrderType = 'TABLE' | 'TAKEAWAY' | 'DELIVERY';

/** Estados posibles de un pedido a lo largo de su ciclo de vida */
type OrderStatus = 'OPEN' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PAID' | 'CANCELLED';

/** Interfaz de un producto del menú (para el selector de productos) */
interface MenuItem { id: string; name: string; price: number; category?: { name: string } }

/** Interfaz de una mesa del local */
interface Table { id: string; name: string; status: string; capacity: number }

/** Interfaz de un ítem dentro de un pedido (producto con cantidad y precio) */
interface OrderItem { id: string; productId: string; quantity: number; price: number; product: MenuItem }

/** Interfaz completa de un pedido con todos sus datos y relaciones */
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

/** Etiquetas en español para cada estado de pedido */
const STATUS_LABELS: Record<OrderStatus, string> = {
  OPEN: 'Abierto', PREPARING: 'Preparando', READY: 'Listo',
  DELIVERED: 'Entregado', PAID: 'Pagado', CANCELLED: 'Cancelado'
};

/** Clases CSS de color para cada estado de pedido (badges) */
const STATUS_COLOR: Record<OrderStatus, string> = {
  OPEN: 'bg-blue-900 text-blue-300', PREPARING: 'bg-yellow-900 text-yellow-300',
  READY: 'bg-green-900 text-green-300', DELIVERED: 'bg-purple-900 text-purple-300',
  PAID: 'bg-gray-700 text-gray-300', CANCELLED: 'bg-red-900 text-red-300'
};

/**
 * Componente principal de la página de Pedidos.
 * Renderiza las pestañas por tipo de pedido, la grilla de pedidos activos
 * y un modal completo para crear nuevos pedidos con carrito de productos.
 *
 * @returns JSX de la página completa de pedidos
 */
export default function OrdersPage() {
  /** Lista de todos los pedidos obtenidos de la API */
  const [orders, setOrders] = useState<Order[]>([]);

  /** Lista de productos del menú disponibles para agregar a un pedido */
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  /** Lista de mesas del local (para pedidos de tipo TABLE) */
  const [tables, setTables] = useState<Table[]>([]);

  /** Indicador de carga durante la obtención inicial de datos */
  const [loading, setLoading] = useState(true);

  /** Pestaña activa que determina el tipo de pedido mostrado (TABLE, TAKEAWAY, DELIVERY) */
  const [activeTab, setActiveTab] = useState<OrderType>('TABLE');

  /** Controla la visibilidad del modal de creación de pedido */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Texto de búsqueda para filtrar productos en el selector del modal */
  const [searchProduct, setSearchProduct] = useState('');

  /** Mensaje de error para mostrar en el formulario de nuevo pedido */
  const [error, setError] = useState('');

  /**
   * Estado del formulario de nuevo pedido.
   * - type: tipo de pedido (TABLE, TAKEAWAY, DELIVERY)
   * - tableId: mesa seleccionada (solo para tipo TABLE)
   * - deliveryAddress: dirección de entrega (solo para tipo DELIVERY)
   * - items: productos seleccionados con cantidad y precio
   */
  // New order form state
  const [newOrder, setNewOrder] = useState<{
    type: OrderType;
    tableId: string;
    deliveryAddress: string;
    items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  }>({ type: 'TABLE', tableId: '', deliveryAddress: '', items: [] });

  /**
   * Obtiene todos los datos necesarios: pedidos, productos del menú y mesas.
   * Se ejecuta al montar el componente y después de cada operación.
   */
  const fetchAll = async () => {
    try {
      // Carga en paralelo pedidos, productos y mesas
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

  /**
   * useEffect: Se ejecuta una sola vez al montar el componente.
   * Carga pedidos, productos y mesas.
   */
  useEffect(() => { fetchAll(); }, []);

  /**
   * Agrega un producto al carrito del nuevo pedido.
   * Si el producto ya existe en el carrito, incrementa su cantidad en 1.
   * Si no existe, lo agrega con cantidad 1.
   *
   * @param product - Producto del menú a agregar
   */
  const addProductToOrder = (product: MenuItem) => {
    const existing = newOrder.items.find((i) => i.productId === product.id);
    if (existing) {
      // Si ya está en el carrito, incrementar cantidad
      setNewOrder({ ...newOrder, items: newOrder.items.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      )});
    } else {
      // Si es nuevo, agregar con cantidad 1
      setNewOrder({ ...newOrder, items: [...newOrder.items, {
        productId: product.id, name: product.name, price: product.price, quantity: 1
      }]});
    }
  };

  /**
   * Elimina un producto del carrito del nuevo pedido.
   *
   * @param productId - ID del producto a eliminar
   */
  const removeItem = (productId: string) => {
    setNewOrder({ ...newOrder, items: newOrder.items.filter((i) => i.productId !== productId) });
  };

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * Si la cantidad llega a 0 o menos, elimina el producto del carrito.
   *
   * @param productId - ID del producto a actualizar
   * @param qty - Nueva cantidad
   */
  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    setNewOrder({ ...newOrder, items: newOrder.items.map((i) =>
      i.productId === productId ? { ...i, quantity: qty } : i
    )});
  };

  /** Cálculo del total del nuevo pedido (suma de precio * cantidad de cada ítem) */
  const orderTotal = newOrder.items.reduce((s, i) => s + i.price * i.quantity, 0);

  /**
   * Manejador del envío del formulario de nuevo pedido.
   * Valida que haya al menos un producto y (si es tipo TABLE) que haya una mesa seleccionada.
   * Envía la petición POST /orders con los datos del pedido.
   *
   * @param e - Evento del formulario
   */
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validaciones de negocio antes de enviar
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
      // Reiniciar el formulario de nuevo pedido
      setNewOrder({ type: 'TABLE', tableId: '', deliveryAddress: '', items: [] });
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Error al crear el pedido');
    }
  };

  /**
   * Actualiza el estado de un pedido existente.
   * Se usa para avanzar en el flujo: OPEN → PREPARING → READY
   *
   * @param orderId - ID del pedido a actualizar
   * @param status - Nuevo estado del pedido
   */
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await apiFetch(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  /**
   * Cierra/cobra un pedido (lo marca como PAID).
   * Llama al endpoint especializado POST /orders/:id/close.
   *
   * @param orderId - ID del pedido a cobrar
   */
  const handleClose = async (orderId: string) => {
    try {
      await apiFetch(`/orders/${orderId}/close`, { method: 'POST' });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  /**
   * Cancela un pedido con confirmación del usuario.
   * Llama al endpoint POST /orders/:id/cancel.
   *
   * @param orderId - ID del pedido a cancelar
   */
  const handleCancel = async (orderId: string) => {
    if (!confirm('¿Cancelar este pedido?')) return;
    try {
      await apiFetch(`/orders/${orderId}/cancel`, { method: 'POST' });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  // Filtrar solo pedidos activos del tipo seleccionado (excluir PAID y CANCELLED)
  const activeOrders = orders.filter((o) =>
    o.type === activeTab && !['PAID', 'CANCELLED'].includes(o.status)
  );

  // Filtrar productos del menú según el texto de búsqueda
  const filteredProducts = menuItems.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  /** Configuración de las pestañas de tipos de pedido con etiquetas e iconos */
  const tabs: { key: OrderType; label: string; icon: string }[] = [
    { key: 'TABLE', label: 'En Mesa', icon: '🍽️' },
    { key: 'TAKEAWAY', label: 'Para Llevar', icon: '🥡' },
    { key: 'DELIVERY', label: 'Delivery', icon: '🛵' }
  ];

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      {/* ===================== Encabezado y botón de nuevo pedido ===================== */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Pedidos</h1>
          <p className="text-gray-400">Gestiona los pedidos activos del local</p>
        </div>
        {/* Botón que abre el modal de nuevo pedido, pre-seleccionando el tipo activo */}
        <button
          onClick={() => { setIsModalOpen(true); setError(''); setNewOrder({ type: activeTab, tableId: '', deliveryAddress: '', items: [] }); }}
          className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
        >
          + Nuevo Pedido
        </button>
      </div>

      {/* ===================== Pestañas por tipo de pedido ===================== */}
      {/* Cada pestaña muestra un contador de pedidos activos de ese tipo */}
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
            {/* Contador de pedidos activos por tipo */}
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#2F3D46] text-[#A3B31A]' : 'bg-[#2F3D46] text-gray-400'}`}>
              {orders.filter((o) => o.type === tab.key && !['PAID', 'CANCELLED'].includes(o.status)).length}
            </span>
          </button>
        ))}
      </div>

      {/* ===================== Grilla de pedidos activos ===================== */}
      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando pedidos...</div>
      ) : activeOrders.length === 0 ? (
        /* Estado vacío cuando no hay pedidos activos en esta sección */
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
              {/* Cabecera de la tarjeta: tipo de pedido, mesa/dirección, hora y mozo */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">
                    {order.type === 'TABLE' ? `Mesa: ${order.table?.name || '?'}` :
                     order.type === 'TAKEAWAY' ? 'Para Llevar' : `Delivery`}
                  </div>
                  {/* Dirección de entrega (solo para delivery) */}
                  {order.deliveryAddress && (
                    <div className="text-xs text-gray-400 mt-0.5">{order.deliveryAddress}</div>
                  )}
                  {/* Hora de creación y nombre del mozo */}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    {order.waiter && ` · ${order.waiter.name}`}
                  </div>
                </div>
                {/* Badge con el estado actual del pedido */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Lista de productos del pedido con cantidad y subtotal */}
              <div className="border-t border-[#4a5a67] pt-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.quantity}x {item.product.name}</span>
                    <span className="text-[#39FF8B]">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              {/* Pie de la tarjeta: total y botones de acción */}
              <div className="flex justify-between items-center border-t border-[#4a5a67] pt-3 mt-auto">
                <span className="font-bold text-[#39FF8B] text-lg">${order.total.toLocaleString('es-AR')}</span>
                <div className="flex gap-2">
                  {/* Botón para avanzar estado (Preparar o Listo), visible solo si no está en DELIVERED o READY */}
                  {order.status !== 'DELIVERED' && order.status !== 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status === 'OPEN' ? 'PREPARING' : 'READY')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#A3B31A] text-[#2F3D46] font-semibold hover:bg-[#8e9e16] transition"
                    >
                      {order.status === 'OPEN' ? '▶ Preparar' : '✓ Listo'}
                    </button>
                  )}
                  {/* Botón para cobrar/cerrar el pedido */}
                  <button
                    onClick={() => handleClose(order.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-700 text-green-100 font-semibold hover:bg-green-600 transition"
                  >
                    💵 Cobrar
                  </button>
                  {/* Botón para cancelar el pedido */}
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

      {/* ===================== Modal de creación de nuevo pedido ===================== */}
      {/* Modal dividido en dos paneles: formulario (izquierda) y selector de productos (derecha) */}
      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#4a5a67]">
              <h2 className="text-2xl font-bold text-[#A3B31A]">Nuevo Pedido</h2>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* ===== Panel izquierdo: Formulario del pedido ===== */}
              {/* Left: order form */}
              <form onSubmit={handleSubmitOrder} className="w-1/2 p-5 flex flex-col gap-4 overflow-y-auto border-r border-[#4a5a67]">
                {/* Selector de tipo de pedido (mesa, para llevar, delivery) */}
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

                {/* Selector de mesa (solo visible para pedidos tipo TABLE) */}
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
                      {/* Solo mostrar mesas libres u ocupadas (no reservadas) */}
                      {tables.filter((t) => t.status === 'FREE' || t.status === 'OCCUPIED').map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Campo de dirección (solo visible para pedidos tipo DELIVERY) */}
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

                {/* Lista de productos agregados al carrito del pedido */}
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
                          {/* Controles de cantidad: decrementar, cantidad actual, incrementar */}
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 rounded bg-[#4a5a67] text-white hover:bg-red-700 transition text-center">−</button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 rounded bg-[#4a5a67] text-white hover:bg-green-700 transition text-center">+</button>
                          </div>
                          {/* Subtotal del ítem */}
                          <span className="text-[#39FF8B] text-sm font-semibold w-20 text-right">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                {/* Pie del formulario: total y botones de acción */}
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

              {/* ===== Panel derecho: Selector de productos del menú ===== */}
              {/* Right: product selector */}
              <div className="w-1/2 p-5 flex flex-col overflow-y-auto">
                {/* Barra de búsqueda de productos */}
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none mb-3"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                {/* Lista de productos disponibles (click para agregar al carrito) */}
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
