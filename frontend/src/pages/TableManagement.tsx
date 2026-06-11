import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'PENDING_PAYMENT';

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  linkedTableId?: string | null;
}

const STATUS_CONFIG: Record<TableStatus, { label: string; color: string; dot: string }> = {
  FREE: { label: 'Libre', color: 'border-green-500 bg-green-500/10', dot: 'bg-green-400' },
  OCCUPIED: { label: 'Ocupada', color: 'border-red-500 bg-red-500/10', dot: 'bg-red-400' },
  RESERVED: { label: 'Reservada', color: 'border-yellow-500 bg-yellow-500/10', dot: 'bg-yellow-400' },
  PENDING_PAYMENT: { label: 'Pendiente de cobro', color: 'border-orange-500 bg-orange-500/10', dot: 'bg-orange-400' }
};

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', capacity: 4, linkedTableId: '' });

  const fetchTables = async () => {
    try {
      const data = await apiFetch<Table[]>('/tables');
      setTables(data);
    } catch (e) {
      console.error('Error fetching tables:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleOpenModal = (table?: Table) => {
    setError('');
    if (table) {
      setEditingTable(table);
      setFormData({ name: table.name, capacity: table.capacity, linkedTableId: table.linkedTableId || '' });
    } else {
      setEditingTable(null);
      setFormData({ name: `Mesa ${tables.length + 1}`, capacity: 4, linkedTableId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const method = editingTable ? 'PATCH' : 'POST';
    const path = editingTable ? `/tables/${editingTable.id}` : '/tables';

    try {
      await apiFetch(path, { 
        method, 
        body: JSON.stringify({
          ...formData,
          status: editingTable ? undefined : 'FREE',
          linkedTableId: formData.linkedTableId || null
        }) 
      });
      setIsModalOpen(false);
      fetchTables();
    } catch (e: any) {
      setError(e.message || 'Error al guardar la mesa');
    }
  };

  const handleChangeStatus = async (table: Table, status: TableStatus) => {
    try {
      await apiFetch(`/tables/${table.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchTables();
    } catch (e) {
      console.error('Error changing status:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta mesa? Esta acción no se puede deshacer.')) return;
    try {
      await apiFetch(`/tables/${id}`, { method: 'DELETE' });
      fetchTables();
    } catch (e) {
      console.error('Error deleting table:', e);
    }
  };

  const counts = {
    FREE: tables.filter((t) => t.status === 'FREE').length,
    OCCUPIED: tables.filter((t) => t.status === 'OCCUPIED').length,
    RESERVED: tables.filter((t) => t.status === 'RESERVED').length,
    PENDING_PAYMENT: tables.filter((t) => t.status === 'PENDING_PAYMENT').length,
  };

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Mesas y Salón</h1>
          <p className="text-gray-400">Gestiona el estado de las mesas del local y uniones</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
        >
          + Nueva Mesa
        </button>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {(Object.entries(STATUS_CONFIG) as [TableStatus, typeof STATUS_CONFIG[TableStatus]][]).map(([key, cfg]) => (
          <div key={key} className="bg-[#3a4d59] rounded-xl border border-[#4a5a67] p-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
            <div>
              <div className="text-2xl font-bold">{counts[key]}</div>
              <div className="text-xs text-gray-400">{cfg.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables grid */}
      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando mesas...</div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🪑</div>
          <p className="text-lg">No hay mesas creadas aún</p>
          <button onClick={() => handleOpenModal()} className="mt-4 text-[#A3B31A] hover:underline">
            Crear la primera mesa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => {
            const cfg = STATUS_CONFIG[table.status];
            const linkedTable = table.linkedTableId ? tables.find(t => t.id === table.linkedTableId) : null;
            return (
              <div
                key={table.id}
                className={`rounded-2xl border-2 p-4 flex flex-col gap-3 transition ${cfg.color} ${table.linkedTableId ? 'border-dashed' : ''}`}
              >
                {/* Table name and status */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{table.name}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                </div>
                <div className="text-xs text-gray-400">
                  Capacidad: {table.capacity} personas
                  {linkedTable && (
                    <div className="text-[#A3B31A] mt-1 font-semibold flex items-center gap-1">
                      <span>🔗</span> Unida con: {linkedTable.name}
                    </div>
                  )}
                </div>
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${cfg.dot} bg-opacity-20 text-white`}>
                  {cfg.label}
                </div>

                {/* Status change buttons */}
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {(Object.entries(STATUS_CONFIG) as [TableStatus, typeof STATUS_CONFIG[TableStatus]][])
                    .filter(([key]) => key !== table.status)
                    .map(([key, c]) => (
                      <button
                        key={key}
                        onClick={() => handleChangeStatus(table, key)}
                        className="text-xs py-1 px-1.5 rounded-lg bg-[#2F3D46] hover:bg-[#4a5a67] text-gray-300 transition truncate"
                        title={c.label}
                      >
                        {c.label}
                      </button>
                    ))}
                </div>

                {/* Edit / Delete */}
                <div className="flex justify-between mt-auto pt-2 border-t border-white/10">
                  <button onClick={() => handleOpenModal(table)} className="text-xs text-[#A3B31A] hover:underline">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(table.id)} className="text-xs text-red-400 hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">
              {editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre de la Mesa</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mesa 1, Terraza A..."
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Capacidad (personas)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Unir a otra mesa</label>
                <select
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.linkedTableId}
                  onChange={(e) => setFormData({ ...formData, linkedTableId: e.target.value })}
                >
                  <option value="">Ninguna</option>
                  {tables
                    .filter((t) => t.id !== editingTable?.id)
                    .map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-6 rounded-lg hover:bg-[#8e9e16] transition">
                  {editingTable ? 'Guardar' : 'Crear Mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
