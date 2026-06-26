/**
 * ============================================================
 * CashBookPage.tsx
 * ============================================================
 * Esta página representa el Libro de Caja (Cash Book) del sistema.
 * Permite visualizar el historial de movimientos de dinero (ingresos y egresos),
 * calcular el saldo actual de la caja y registrar nuevos movimientos manuales.
 * 
 * Tabla(s) relacionada(s): CashEntry
 * Módulo: Frontend / Páginas
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface CashEntry {
  id: string;
  type: 'OPENING' | 'CLOSING' | 'SALE' | 'EXPENSE' | 'ADJUSTMENT';
  amount: number;
  description: string;
  createdAt: string;
}

/**
 * Componente principal de la página del Libro de Caja.
 * Renderiza la vista general con el saldo actual, tabla de movimientos
 * y el modal para crear nuevos registros.
 */
export default function CashBookPage() {
  // Estado para almacenar la lista de movimientos obtenidos de la API
  const [entries, setEntries] = useState<CashEntry[]>([]);
  // Estado para mostrar un indicador de carga mientras se obtienen los datos
  const [loading, setLoading] = useState(true);
  // Estado que controla la visibilidad del modal de "Nuevo Movimiento"
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado del formulario para crear un nuevo movimiento

  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: 0,
    description: ''
  });

  /**
   * Obtiene la lista de movimientos de caja desde el backend.
   * Actualiza el estado `entries` con la respuesta y desactiva el estado `loading`.
   */
  const fetchEntries = async () => {
    try {
      const data = await apiFetch<CashEntry[]>('/cash-entries');
      setEntries(data);
    } catch (e) {
      console.error('Error fetching cash entries:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto de inicialización.
   * Se ejecuta una sola vez al cargar la página para obtener los movimientos.
   */
  useEffect(() => {
    fetchEntries();
  }, []);

  /**
   * Maneja el envío del formulario para registrar un nuevo movimiento de caja.
   * Hace una petición POST a la API y actualiza la lista local de movimientos.
   * 
   * @param e - Evento de envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/cash-entries', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ type: 'EXPENSE', amount: 0, description: '' });
      fetchEntries();
    } catch (e: any) {
      alert(e.message || 'Error al guardar el registro');
    }
  };

  /**
   * Calcula el saldo actual de la caja sumando los ingresos y restando los egresos.
   * 'OPENING' y 'SALE' suman al saldo. 'CLOSING' y 'EXPENSE' restan.
   */
  const currentBalance = entries.reduce((acc, entry) => {
    if (['OPENING', 'SALE'].includes(entry.type)) return acc + entry.amount;
    if (['CLOSING', 'EXPENSE'].includes(entry.type)) return acc - entry.amount;
    return acc + entry.amount; // Adjustment can be positive or negative
  }, 0);

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Libro de Caja</h1>
          <p className="text-gray-400">Controla los ingresos, egresos y el saldo actual</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
        >
          + Nuevo Movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#3a4d59] border border-[#4a5a67] rounded-2xl p-6">
          <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Saldo Actual</h3>
          <p className="text-4xl font-bold text-[#A3B31A]">${currentBalance.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando movimientos...</div>
      ) : (
        <div className="bg-[#3a4d59] rounded-2xl border border-[#4a5a67] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#2F3D46] text-gray-400 text-sm uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a5a67]">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
                    No hay movimientos registrados.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-[#4a5a67] transition">
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                        ${['OPENING', 'SALE'].includes(e.type) ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}
                      `}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{e.description || '-'}</td>
                    <td className={`px-6 py-4 text-right font-medium ${['OPENING', 'SALE'].includes(e.type) ? 'text-[#39FF8B]' : 'text-red-400'}`}>
                      {['CLOSING', 'EXPENSE'].includes(e.type) ? '-' : ''}${e.amount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">Nuevo Movimiento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Tipo *</label>
                <select
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="EXPENSE">Egreso / Gasto</option>
                  <option value="ADJUSTMENT">Ajuste (Ingreso o Egreso)</option>
                  <option value="OPENING">Apertura de Caja</option>
                  <option value="CLOSING">Cierre de Caja</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Descripción</label>
                <input
                  type="text"
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Compra de insumos..."
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-6 rounded-lg hover:bg-[#8e9e16] transition">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
