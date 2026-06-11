import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: ''
  });

  const [catFormData, setCatFormData] = useState({ name: '' });

  const fetchData = async () => {
    try {
      const [menuData, catData] = await Promise.all([
        apiFetch<MenuItem[]>('/menu-items'),
        apiFetch<Category[]>('/categories')
      ]);
      setItems(menuData);
      setCategories(catData.filter((c) => c.type === 'MENU'));
    } catch (e) {
      console.error('Error fetching menu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const method = editingItem ? 'PATCH' : 'POST';
    const path = editingItem ? `/menu-items/${editingItem.id}` : '/menu-items';

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
      setError(e.message || 'Error al guardar el producto del menú');
    }
  };

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

  const filtered = filterCategory
    ? items.filter((p) => p.categoryId === filterCategory)
    : items;

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Menú (Carta)</h1>
          <p className="text-gray-400">Gestiona los platos y bebidas que vendes a los clientes</p>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-[#3a4d59] hover:bg-[#4a5a67] text-white py-2 px-4 rounded-xl transition border border-[#4a5a67]"
          >
            + Categoría
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
          >
            + Nuevo Plato / Bebida
          </button>
        </div>
      </div>

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

      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando menú...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-10 text-center text-gray-500 italic">
              No hay productos en el menú.
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className={`bg-[#3a4d59] border border-[#4a5a67] rounded-2xl p-5 hover:border-[#A3B31A]/50 transition shadow-lg flex flex-col ${!p.isActive ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <span className="bg-[#2F3D46] text-[#A3B31A] font-bold px-3 py-1 rounded-lg">
                    ${p.price.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                  {p.category?.name || 'Sin categoría'}
                </div>
                <p className="text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
                  {p.description || <span className="italic text-gray-500">Sin descripción</span>}
                </p>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#4a5a67]">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="space-x-3">
                    <button onClick={() => handleToggleActive(p)} className="text-gray-400 hover:text-white transition text-sm">
                      {p.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => handleOpenModal(p)} className="text-[#A3B31A] hover:text-[#c9d929] transition text-sm font-medium">
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Item Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">
              {editingItem ? 'Editar Plato / Bebida' : 'Nuevo Plato / Bebida'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-gray-400 text-sm mb-1">Descripción / Ingredientes</label>
                <textarea
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Pan artesanal, doble carne, cheddar, bacon..."
                />
              </div>
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
              {error && <p className="text-red-400 text-sm">{error}</p>}
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

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">Nueva Categoría (Menú)</h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
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
