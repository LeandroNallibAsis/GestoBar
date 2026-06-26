/**
 * ============================================================
 * InventoryPage.tsx
 * ============================================================
 * Página de gestión de inventario del bar/restaurante.
 * Permite administrar los insumos y materias primas que se
 * utilizan en la operación del local.
 *
 * Funcionalidades:
 * - Listar todos los insumos del inventario en una tabla
 * - Filtrar insumos por categoría de inventario
 * - Crear nuevos insumos (nombre, costo, stock, unidad, categoría)
 * - Editar insumos existentes
 * - Activar/desactivar insumos
 * - Transferir un insumo al menú como producto de venta directa
 *   (crea un MenuItem a partir de un InventoryItem)
 * - Crear nuevas categorías de tipo INVENTORY
 *
 * Llamadas a la API:
 * - GET /inventory-items → Obtener todos los insumos
 * - POST /inventory-items → Crear un nuevo insumo
 * - PATCH /inventory-items/:id → Actualizar un insumo existente
 * - GET /categories → Obtener todas las categorías (se filtran INVENTORY y MENU)
 * - POST /categories → Crear nueva categoría de tipo INVENTORY
 * - POST /menu-items → Crear un producto en el menú (al transferir desde inventario)
 *
 * Tabla(s) relacionada(s): InventoryItem, Category, MenuItem
 * Módulo: Inventario
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

/**
 * Interfaz que representa un insumo del inventario.
 * - cost: costo de compra por unidad
 * - stock: cantidad actual disponible
 * - unit: unidad de medida (un, kg, l, gr, ml)
 * - isActive: indica si el insumo está activo en el sistema
 */
interface InventoryItem {
  id: string;
  name: string;
  cost: number;
  stock: number;
  unit: string;
  isActive: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
}

/**
 * Interfaz que representa una categoría.
 * - type: 'INVENTORY' para insumos, 'MENU' para productos de venta
 */
interface Category {
  id: string;
  name: string;
  type: string;
}

/**
 * Componente principal de la página de Inventario.
 * Renderiza una tabla con todos los insumos, filtros por categoría,
 * y modales para creación, edición y transferencia al menú.
 *
 * @returns JSX de la página completa de inventario
 */
export default function InventoryPage() {
  /** Lista de todos los insumos del inventario */
  const [items, setItems] = useState<InventoryItem[]>([]);

  /** Lista de categorías de tipo INVENTORY */
  const [categories, setCategories] = useState<Category[]>([]);

  /** Indicador de carga durante la obtención inicial de datos */
  const [loading, setLoading] = useState(true);

  /** Controla la visibilidad del modal de creación/edición de insumos */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Controla la visibilidad del modal de creación de categorías */
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  /** Controla la visibilidad del modal de transferencia al menú */
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  /** Lista de categorías de tipo MENU (usadas en el modal de transferencia) */
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);

  /** Insumo seleccionado para transferir al menú */
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);

  /** Insumo que se está editando actualmente (null si es creación nueva) */
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  /** Mensaje de error para mostrar en el formulario */
  const [error, setError] = useState('');

  /** ID de la categoría seleccionada para filtrar, cadena vacía = "Todos" */
  const [filterCategory, setFilterCategory] = useState('');

  /** Estado del formulario de creación/edición de insumos */
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    stock: 0,
    unit: 'un',
    categoryId: ''
  });

  /** Estado del formulario de transferencia al menú (precio de venta y categoría del menú) */
  const [transferFormData, setTransferFormData] = useState({ price: 0, categoryId: '' });

  /** Estado del formulario de creación de categorías */
  const [catFormData, setCatFormData] = useState({ name: '' });

  /**
   * Obtiene los insumos del inventario y todas las categorías desde la API.
   * Separa las categorías en dos listas: INVENTORY (para filtros) y MENU
   * (para el modal de transferencia).
   */
  const fetchData = async () => {
    try {
      // Ejecutar ambas peticiones en paralelo
      const [invData, catData] = await Promise.all([
        apiFetch<InventoryItem[]>('/inventory-items'),
        apiFetch<Category[]>('/categories')
      ]);
      setItems(invData);
      // Separar categorías por tipo
      setCategories(catData.filter((c) => c.type === 'INVENTORY'));
      setMenuCategories(catData.filter((c) => c.type === 'MENU'));
    } catch (e) {
      console.error('Error fetching inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * useEffect: Se ejecuta una sola vez al montar el componente.
   * Carga los insumos y categorías disponibles.
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Abre el modal de formulario para crear o editar un insumo.
   * Si recibe un item, precarga los datos para edición.
   *
   * @param item - Insumo a editar (opcional; si no se pasa, se abre para creación)
   */
  const handleOpenModal = (item?: InventoryItem) => {
    setError('');
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        cost: item.cost,
        stock: item.stock,
        unit: item.unit || 'un',
        categoryId: item.categoryId || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', cost: 0, stock: 0, unit: 'un', categoryId: '' });
    }
    setIsModalOpen(true);
  };

  /**
   * Abre el modal de transferencia al menú para un insumo específico.
   * Sugiere un precio de venta con un margen del 50% sobre el costo.
   *
   * @param item - Insumo que se quiere agregar al menú
   */
  const handleOpenTransferModal = (item: InventoryItem) => {
    setTransferItem(item);
    setTransferFormData({ price: Math.ceil(item.cost * 1.5), categoryId: '' }); // Sugerir un 50% de ganancia por defecto
    setIsTransferModalOpen(true);
  };

  /**
   * Manejador del envío del formulario de insumo.
   * Determina si es creación (POST) o actualización (PATCH).
   * Después de guardar, cierra el modal y recarga los datos.
   *
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const method = editingItem ? 'PATCH' : 'POST';
    const path = editingItem ? `/inventory-items/${editingItem.id}` : '/inventory-items';

    try {
      await apiFetch(path, {
        method,
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || undefined
        })
      });
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message || 'Error al guardar el insumo');
    }
  };

  /**
   * Manejador del envío del formulario de nueva categoría de inventario.
   * Crea una categoría de tipo 'INVENTORY' en la API.
   *
   * @param e - Evento del formulario
   */
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: catFormData.name, type: 'INVENTORY' })
      });
      setCatFormData({ name: '' });
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Error al crear categoría');
    }
  };

  /**
   * Manejador del envío del formulario de transferencia al menú.
   * Crea un nuevo MenuItem basado en los datos del insumo seleccionado,
   * con el precio de venta y categoría de menú indicados por el usuario.
   *
   * @param e - Evento del formulario
   */
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItem) return;
    try {
      await apiFetch('/menu-items', {
        method: 'POST',
        body: JSON.stringify({
          name: transferItem.name,
          description: `Importado desde inventario (Se vende por ${transferItem.unit})`,
          price: transferFormData.price,
          categoryId: transferFormData.categoryId || undefined
        })
      });
      setIsTransferModalOpen(false);
      alert('Producto agregado al menú exitosamente');
    } catch (e: any) {
      alert(e.message || 'Error al agregar al menú');
    }
  };

  /**
   * Alterna el estado activo/inactivo de un insumo.
   *
   * @param item - Insumo cuyo estado se quiere cambiar
   */
  const handleToggleActive = async (item: InventoryItem) => {
    try {
      await apiFetch(`/inventory-items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !item.isActive })
      });
      fetchData();
    } catch (e) {
      console.error('Error toggling item:', e);
    }
  };

  // Filtrar insumos por la categoría seleccionada
  const filtered = filterCategory
    ? items.filter((p) => p.categoryId === filterCategory)
    : items;

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      {/* ===================== Encabezado y botones de acción ===================== */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Inventario</h1>
          <p className="text-gray-400">Gestiona el stock de insumos y materias primas</p>
        </div>
        <div className="space-x-3">
          {/* Botón para crear nueva categoría de inventario */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-[#3a4d59] hover:bg-[#4a5a67] text-white py-2 px-4 rounded-xl transition border border-[#4a5a67]"
          >
            + Categoría
          </button>
          {/* Botón para crear nuevo insumo */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
          >
            + Nuevo Insumo
          </button>
        </div>
      </div>

      {/* ===================== Filtro por categorías ===================== */}
      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            filterCategory === '' ? 'bg-[#A3B31A] text-[#2F3D46]' : 'bg-[#3a4d59] text-gray-300 hover:bg-[#4a5a67]'
          }`}
        >
          Todos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              filterCategory === c.id ? 'bg-[#A3B31A] text-[#2F3D46]' : 'bg-[#3a4d59] text-gray-300 hover:bg-[#4a5a67]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ===================== Tabla de insumos ===================== */}
      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando inventario...</div>
      ) : (
        <div className="bg-[#3a4d59] rounded-2xl border border-[#4a5a67] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#2F3D46] text-gray-400 text-sm uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4">Insumo</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Costo Unitario</th>
                <th className="px-6 py-4">Stock Actual</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a5a67]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                    No hay insumos cargados.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-[#4a5a67] transition ${!p.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {p.category?.name || <span className="italic text-gray-600">Sin categoría</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      ${p.cost.toLocaleString('es-AR')}
                    </td>
                    {/* El stock se muestra en rojo si es menor a 5 unidades (stock bajo) */}
                    <td className="px-6 py-4">
                      <span className={`font-medium ${p.stock < 5 ? 'text-red-400' : 'text-[#39FF8B]'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {/* Columna de acciones: transferir al menú, editar, activar/desactivar */}
                    <td className="px-6 py-4 text-right space-x-4">
                      <button onClick={() => handleOpenTransferModal(p)} className="text-blue-400 hover:text-blue-300 transition text-sm">
                        Al Menú
                      </button>
                      <button onClick={() => handleOpenModal(p)} className="text-[#A3B31A] hover:text-[#c9d929] transition text-sm">
                        Editar
                      </button>
                      <button onClick={() => handleToggleActive(p)} className="text-gray-400 hover:text-white transition text-sm">
                        {p.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== Modal de creación/edición de insumo ===================== */}
      {/* Item Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">
              {editingItem ? 'Editar Insumo' : 'Nuevo Insumo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Nombre del insumo */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Carne de Lomo"
                />
              </div>
              {/* Campo: Selector de categoría de inventario */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Categoría</label>
                <select
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {/* Fila de 3 columnas: Unidad, Costo y Stock */}
              <div className="grid grid-cols-3 gap-4">
                {/* Selector de unidad de medida */}
                <div className="col-span-1">
                  <label className="block text-gray-400 text-sm mb-1">Unidad</label>
                  <select
                    className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="un">Unidades (un)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="l">Litros (l)</option>
                    <option value="gr">Gramos (gr)</option>
                    <option value="ml">Mililitros (ml)</option>
                  </select>
                </div>
                {/* Campo: Costo de compra por unidad */}
                <div className="col-span-1">
                  <label className="block text-gray-400 text-sm mb-1">Costo *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  />
                </div>
                {/* Campo: Cantidad de stock actual */}
                <div className="col-span-1">
                  <label className="block text-gray-400 text-sm mb-1">Stock Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-6 rounded-lg hover:bg-[#8e9e16] transition">
                  {editingItem ? 'Guardar Cambios' : 'Crear Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== Modal de creación de categoría ===================== */}
      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">Nueva Categoría (Inventario)</h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ name: e.target.value })}
                  placeholder="Ej: Carnes, Bebidas, Lácteos..."
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-6 rounded-lg hover:bg-[#8e9e16] transition">
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== Modal de transferencia al menú ===================== */}
      {/* Permite convertir un insumo del inventario en un producto del menú de venta */}
      {/* Transfer to Menu Modal */}
      {isTransferModalOpen && transferItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-blue-400/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Agregar al Menú</h2>
            <p className="text-gray-300 mb-6 text-sm">Convierte el insumo <strong>{transferItem.name}</strong> en un plato o bebida para la venta.</p>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              {/* Campo: Precio de venta sugerido (con margen del 50% sobre el costo) */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Precio de Venta Sugerido *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-blue-400 outline-none"
                  value={transferFormData.price}
                  onChange={(e) => setTransferFormData({ ...transferFormData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              {/* Selector de categoría del menú para el nuevo producto */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Categoría del Menú</label>
                <select
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-blue-400 outline-none"
                  value={transferFormData.categoryId}
                  onChange={(e) => setTransferFormData({ ...transferFormData, categoryId: e.target.value })}
                >
                  <option value="">Sin categoría</option>
                  {menuCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
