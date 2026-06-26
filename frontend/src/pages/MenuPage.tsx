/**
 * ============================================================
 * MenuPage.tsx
 * ============================================================
 * Página de gestión del menú (carta) del bar/restaurante.
 * Permite al usuario administrar los platos y bebidas que se
 * ofrecen a los clientes.
 *
 * Funcionalidades:
 * - Listar todos los productos del menú agrupados por categoría
 * - Filtrar productos por categoría mediante botones tipo "chip"
 * - Crear nuevos platos/bebidas mediante un modal de formulario
 * - Editar productos existentes (nombre, descripción, precio, categoría)
 * - Activar/desactivar productos del menú
 * - Crear nuevas categorías de tipo MENU
 *
 * Llamadas a la API:
 * - GET /menu-items → Obtener todos los productos del menú
 * - POST /menu-items → Crear un nuevo producto
 * - PATCH /menu-items/:id → Actualizar un producto existente
 * - GET /categories → Obtener todas las categorías (se filtran las de tipo MENU)
 * - POST /categories → Crear una nueva categoría de tipo MENU
 *
 * Tabla(s) relacionada(s): MenuItem, Category
 * Módulo: Menú / Carta
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

/**
 * Interfaz que representa un producto del menú.
 * - isActive: indica si el producto está disponible para la venta
 * - categoryId: FK opcional a la categoría del producto
 */
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
}

/**
 * Interfaz que representa una categoría del menú.
 * - type: puede ser 'MENU' o 'INVENTORY', aquí solo se usan las de tipo MENU
 */
interface Category {
  id: string;
  name: string;
  type: string;
}

/**
 * Componente principal de la página de Menú.
 * Renderiza la lista de productos agrupados por categoría,
 * con opciones de filtrado, creación, edición y activación/desactivación.
 *
 * @returns JSX de la página completa del menú
 */
export default function MenuPage() {
  /** Lista de todos los productos del menú obtenidos de la API */
  const [items, setItems] = useState<MenuItem[]>([]);

  /** Lista de categorías de tipo MENU disponibles */
  const [categories, setCategories] = useState<Category[]>([]);

  /** Indicador de carga durante la obtención inicial de datos */
  const [loading, setLoading] = useState(true);

  /** Controla la visibilidad del modal de creación/edición de productos */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Controla la visibilidad del modal de creación de categorías */
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  /** Producto que se está editando actualmente (null si es creación nueva) */
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  /** Mensaje de error para mostrar en el formulario */
  const [error, setError] = useState('');

  /** ID de la categoría seleccionada para filtrar, cadena vacía = "Todos" */
  const [filterCategory, setFilterCategory] = useState('');

  /** Estado del formulario de creación/edición de productos */
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: ''
  });

  /** Estado del formulario de creación de categorías */
  const [catFormData, setCatFormData] = useState({ name: '' });

  /**
   * Obtiene los datos del menú y las categorías desde la API.
   * Se ejecuta al montar el componente y después de cada operación CRUD.
   * Filtra las categorías para mostrar solo las de tipo 'MENU'.
   */
  const fetchData = async () => {
    try {
      // Ejecutar ambas peticiones en paralelo para mayor eficiencia
      const [menuData, catData] = await Promise.all([
        apiFetch<MenuItem[]>('/menu-items'),
        apiFetch<Category[]>('/categories')
      ]);
      setItems(menuData);
      // Solo se muestran las categorías de tipo MENU (no las de INVENTORY)
      setCategories(catData.filter((c) => c.type === 'MENU'));
    } catch (e) {
      console.error('Error fetching menu:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * useEffect: Se ejecuta una sola vez al montar el componente.
   * Carga los productos del menú y las categorías disponibles.
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Abre el modal de formulario para crear un nuevo producto o editar uno existente.
   * Si recibe un item, precarga los datos del formulario para edición.
   * Si no recibe item, limpia el formulario para una nueva creación.
   *
   * @param item - Producto a editar (opcional; si no se pasa, se abre para creación)
   */
  const handleOpenModal = (item?: MenuItem) => {
    setError('');
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        categoryId: item.categoryId || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', price: 0, categoryId: '' });
    }
    setIsModalOpen(true);
  };

  /**
   * Manejador del envío del formulario de producto.
   * Determina si es una creación (POST) o actualización (PATCH) según
   * si hay un producto en edición. Después de guardar, cierra el modal
   * y recarga los datos.
   *
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Determinar si es creación o edición
    const method = editingItem ? 'PATCH' : 'POST';
    const path = editingItem ? `/menu-items/${editingItem.id}` : '/menu-items';

    try {
      await apiFetch(path, {
        method,
        body: JSON.stringify({
          ...formData,
          // Enviar undefined en lugar de cadena vacía para categoryId
          categoryId: formData.categoryId || undefined
        })
      });
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message || 'Error al guardar el producto del menú');
    }
  };

  /**
   * Manejador del envío del formulario de nueva categoría.
   * Crea una categoría de tipo 'MENU' en la API.
   * Después de crear, cierra el modal y recarga los datos.
   *
   * @param e - Evento del formulario
   */
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: catFormData.name, type: 'MENU' })
      });
      setCatFormData({ name: '' });
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Error al crear categoría');
    }
  };

  /**
   * Alterna el estado activo/inactivo de un producto del menú.
   * Un producto inactivo no aparece disponible para pedidos.
   *
   * @param item - Producto cuyo estado se quiere cambiar
   */
  const handleToggleActive = async (item: MenuItem) => {
    try {
      await apiFetch(`/menu-items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !item.isActive })
      });
      fetchData();
    } catch (e) {
      console.error('Error toggling item:', e);
    }
  };

  // Filtrar productos por la categoría seleccionada (si hay filtro activo)
  const filtered = filterCategory
    ? items.filter((p) => p.categoryId === filterCategory)
    : items;

  // Agrupar los productos filtrados por categoría para renderizar en bloques
  const groupedItems = filtered.reduce((acc, item) => {
    const catId = item.categoryId || 'uncategorized';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Crear los bloques de categoría con su título para la visualización
  const categoryBlocks = Object.keys(groupedItems).map((catId) => {
    let title = 'Sin categoría';
    if (catId !== 'uncategorized') {
      const cat = categories.find((c) => c.id === catId);
      if (cat) title = cat.name;
    }
    return {
      id: catId,
      title,
      items: groupedItems[catId]
    };
  });

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      {/* ===================== Encabezado y botones de acción ===================== */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Menú (Carta)</h1>
          <p className="text-gray-400">Gestiona los platos y bebidas que vendes a los clientes</p>
        </div>
        <div className="space-x-3">
          {/* Botón para abrir el modal de nueva categoría */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-[#3a4d59] hover:bg-[#4a5a67] text-white py-2 px-4 rounded-xl transition border border-[#4a5a67]"
          >
            + Categoría
          </button>
          {/* Botón para abrir el modal de nuevo producto */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
          >
            + Nuevo Plato / Bebida
          </button>
        </div>
      </div>

      {/* ===================== Filtro por categorías ===================== */}
      {/* Botones tipo "chip" para filtrar por categoría o ver todos */}
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

      {/* ===================== Listado de productos agrupados por categoría ===================== */}
      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando menú...</div>
      ) : (
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-gray-500 italic">
              No hay productos en el menú.
            </div>
          ) : (
            categoryBlocks.map((block) => (
              <div key={block.id} className="bg-[#2F3D46] border border-[#4a5a67] rounded-xl overflow-hidden shadow-lg">
                {/* Encabezado de la sección de categoría */}
                <div className="bg-[#3a4d59] border-b border-[#4a5a67] px-6 py-4 flex items-center">
                  <div className="w-1.5 h-6 bg-[#A3B31A] rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-white tracking-wide uppercase">{block.title}</h2>
                </div>
                {/* Grilla de tarjetas de productos dentro de esta categoría */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {block.items.map((p) => (
                    <div key={p.id} className={`bg-[#3a4d59] border border-[#4a5a67] rounded-2xl p-5 hover:border-[#A3B31A]/50 transition shadow-lg flex flex-col ${!p.isActive ? 'opacity-50' : ''}`}>
                      {/* Nombre del producto y precio */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{p.name}</h3>
                        <span className="bg-[#2F3D46] text-[#A3B31A] font-bold px-3 py-1 rounded-lg">
                          ${p.price.toLocaleString('es-AR')}
                        </span>
                      </div>
                      {/* Nombre de la categoría */}
                      <div className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                        {p.category?.name || 'Sin categoría'}
                      </div>
                      {/* Descripción del producto */}
                      <p className="text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
                        {p.description || <span className="italic text-gray-500">Sin descripción</span>}
                      </p>
                      
                      {/* Pie de la tarjeta: estado y botones de acción */}
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#4a5a67]">
                        {/* Badge de estado activo/inactivo */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                          {p.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        <div className="space-x-3">
                          {/* Botón para activar/desactivar el producto */}
                          <button onClick={() => handleToggleActive(p)} className="text-gray-400 hover:text-white transition text-sm">
                            {p.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          {/* Botón para abrir el modal de edición */}
                          <button onClick={() => handleOpenModal(p)} className="text-[#A3B31A] hover:text-[#c9d929] transition text-sm font-medium">
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===================== Modal de creación/edición de producto ===================== */}
      {/* Item Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">
              {editingItem ? 'Editar Plato / Bebida' : 'Nuevo Plato / Bebida'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Nombre del producto */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Hamburguesa Completa"
                />
              </div>
              {/* Campo: Selector de categoría */}
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
              {/* Campo: Descripción / ingredientes del producto */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Descripción / Ingredientes</label>
                <textarea
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Pan artesanal, doble carne, cheddar, bacon..."
                />
              </div>
              {/* Campo: Precio de venta al público */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Precio de Venta *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
              {/* Mensaje de error condicional */}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {/* Botones de acción del formulario */}
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-6 rounded-lg hover:bg-[#8e9e16] transition">
                  {editingItem ? 'Guardar Cambios' : 'Crear Plato'}
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
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">Nueva Categoría (Menú)</h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              {/* Campo: Nombre de la nueva categoría */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ name: e.target.value })}
                  placeholder="Ej: Hamburguesas, Tragos, Postres..."
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
    </div>
  );
}
