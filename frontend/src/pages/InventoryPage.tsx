import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

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

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    stock: 0,
    unit: 'un',
    categoryId: ''
  });

  const [transferFormData, setTransferFormData] = useState({ price: 0, categoryId: '' });

  const [catFormData, setCatFormData] = useState({ name: '' });

  const fetchData = async () => {
    try {
      const [invData, catData] = await Promise.all([
        apiFetch<InventoryItem[]>('/inventory-items'),
        apiFetch<Category[]>('/categories')
      ]);
      setItems(invData);
      setCategories(catData.filter((c) => c.type === 'INVENTORY'));
      setMenuCategories(catData.filter((c) => c.type === 'MENU'));
    } catch (e) {
      console.error('Error fetching inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleOpenTransferModal = (item: InventoryItem) => {
    setTransferItem(item);
    setTransferFormData({ price: Math.ceil(item.cost * 1.5), categoryId: '' }); // Sugerir un 50% de ganancia por defecto
    setIsTransferModalOpen(true);
  };

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

  const filtered = filterCategory
    ? items.filter((p) => p.categoryId === filterCategory)
    : items;

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Inventario</h1>
          <p className="text-gray-400">Gestiona el stock de insumos y materias primas</p>
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
            + Nuevo Insumo
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

      {/* Item Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">
              {editingItem ? 'Editar Insumo' : 'Nuevo Insumo'}
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
                  placeholder="Ej: Carne de Lomo"
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
              <div className="grid grid-cols-3 gap-4">
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
      {/* Transfer to Menu Modal */}
      {isTransferModalOpen && transferItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-blue-400/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Agregar al Menú</h2>
            <p className="text-gray-300 mb-6 text-sm">Convierte el insumo <strong>{transferItem.name}</strong> en un plato o bebida para la venta.</p>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
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
