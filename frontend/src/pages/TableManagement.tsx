/**
 * ============================================================
 * TableManagement.tsx
 * ============================================================
 * Página de gestión de mesas y salón del bar/restaurante.
 * Permite administrar las mesas del local: crear, editar, eliminar,
 * cambiar estados y vincular mesas entre sí.
 *
 * Funcionalidades:
 * - Visualizar todas las mesas en una grilla con código de colores por estado
 * - Contadores resumen por estado (Libre, Ocupada, Reservada, Pendiente de cobro)
 * - Crear nuevas mesas con nombre, capacidad y vinculación a otra mesa
 * - Editar mesas existentes
 * - Cambiar el estado de una mesa directamente desde la tarjeta
 * - Eliminar mesas con confirmación
 * - Vincular mesas (para unir mesas físicamente)
 *
 * Estados posibles de una mesa:
 * - FREE: Libre y disponible
 * - OCCUPIED: Ocupada por clientes
 * - RESERVED: Reservada para un futuro horario
 * - PENDING_PAYMENT: Con pedido pendiente de cobro
 *
 * Llamadas a la API:
 * - GET /tables → Obtener todas las mesas
 * - POST /tables → Crear una nueva mesa
 * - PATCH /tables/:id → Actualizar nombre, capacidad, estado o vinculación
 * - DELETE /tables/:id → Eliminar una mesa
 *
 * Tabla(s) relacionada(s): Table
 * Módulo: Mesas / Salón
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

/** Tipos de estado posibles para una mesa */
type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'PENDING_PAYMENT';

/**
 * Interfaz que representa una mesa del local.
 * - linkedTableId: FK opcional para vincular con otra mesa (mesas unidas)
 */
interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  linkedTableId?: string | null;
}

/**
 * Configuración visual para cada estado de mesa.
 * Define la etiqueta en español, las clases CSS de color del borde/fondo
 * y el color del indicador circular (dot).
 */
const STATUS_CONFIG: Record<TableStatus, { label: string; color: string; dot: string }> = {
  FREE: { label: 'Libre', color: 'border-green-500 bg-green-500/10', dot: 'bg-green-400' },
  OCCUPIED: { label: 'Ocupada', color: 'border-red-500 bg-red-500/10', dot: 'bg-red-400' },
  RESERVED: { label: 'Reservada', color: 'border-yellow-500 bg-yellow-500/10', dot: 'bg-yellow-400' },
  PENDING_PAYMENT: { label: 'Pendiente de cobro', color: 'border-orange-500 bg-orange-500/10', dot: 'bg-orange-400' }
};

/**
 * Componente principal de la página de Gestión de Mesas.
 * Renderiza los contadores de estado, la grilla de mesas con botones
 * de cambio de estado y un modal para crear/editar mesas.
 *
 * @returns JSX de la página completa de gestión de mesas
 */
export default function TableManagement() {
  /** Lista de todas las mesas del local */
  const [tables, setTables] = useState<Table[]>([]);

  /** Indicador de carga durante la obtención de datos */
  const [loading, setLoading] = useState(true);

  /** Controla la visibilidad del modal de creación/edición */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Mesa que se está editando actualmente (null si es creación nueva) */
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  /** Mensaje de error para mostrar en el formulario */
  const [error, setError] = useState('');

  /** Estado del formulario: nombre, capacidad y mesa vinculada */
  const [formData, setFormData] = useState({ name: '', capacity: 4, linkedTableId: '' });

  /**
   * Obtiene todas las mesas del local desde la API.
   * Se ejecuta al montar y después de cada operación CRUD.
   */
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

  /**
   * useEffect: Se ejecuta una sola vez al montar el componente.
   * Carga todas las mesas.
   */
  useEffect(() => { fetchTables(); }, []);

  /**
   * Abre el modal para crear o editar una mesa.
   * Si recibe una mesa, precarga los datos para edición.
   * Si no, genera un nombre automático "Mesa N" y valores por defecto.
   *
   * @param table - Mesa a editar (opcional)
   */
  const handleOpenModal = (table?: Table) => {
    setError('');
    if (table) {
      setEditingTable(table);
      setFormData({ name: table.name, capacity: table.capacity, linkedTableId: table.linkedTableId || '' });
    } else {
      setEditingTable(null);
      // Generar nombre automático basado en la cantidad de mesas existentes
      setFormData({ name: `Mesa ${tables.length + 1}`, capacity: 4, linkedTableId: '' });
    }
    setIsModalOpen(true);
  };

  /**
   * Manejador del envío del formulario de mesa.
   * Determina si es creación (POST) o actualización (PATCH).
   * Las mesas nuevas se crean con estado FREE por defecto.
   *
   * @param e - Evento del formulario
   */
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
          // Solo asignar estado FREE al crear una nueva mesa
          status: editingTable ? undefined : 'FREE',
          // Enviar null en lugar de cadena vacía si no hay mesa vinculada
          linkedTableId: formData.linkedTableId || null
        }) 
      });
      setIsModalOpen(false);
      fetchTables();
    } catch (e: any) {
      setError(e.message || 'Error al guardar la mesa');
    }
  };

  /**
   * Cambia el estado de una mesa directamente desde la tarjeta.
   * Permite transicionar entre cualquier estado (FREE, OCCUPIED, RESERVED, PENDING_PAYMENT).
   *
   * @param table - Mesa cuyo estado se quiere cambiar
   * @param status - Nuevo estado a asignar
   */
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

  /**
   * Elimina una mesa del sistema con confirmación del usuario.
   *
   * @param id - ID de la mesa a eliminar
   */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta mesa? Esta acción no se puede deshacer.')) return;
    try {
      await apiFetch(`/tables/${id}`, { method: 'DELETE' });
      fetchTables();
    } catch (e) {
      console.error('Error deleting table:', e);
    }
  };

  // Contadores de mesas por estado para el panel de resumen
  const counts = {
    FREE: tables.filter((t) => t.status === 'FREE').length,
    OCCUPIED: tables.filter((t) => t.status === 'OCCUPIED').length,
    RESERVED: tables.filter((t) => t.status === 'RESERVED').length,
    PENDING_PAYMENT: tables.filter((t) => t.status === 'PENDING_PAYMENT').length,
  };

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      {/* ===================== Encabezado y botón de nueva mesa ===================== */}
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

      {/* ===================== Contadores resumen por estado ===================== */}
      {/* Muestra la cantidad de mesas en cada estado */}
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

      {/* ===================== Grilla de mesas ===================== */}
      {/* Cada tarjeta muestra el nombre, capacidad, estado, mesa vinculada
          y botones para cambiar estado, editar y eliminar */}
      {/* Tables grid */}
      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando mesas...</div>
      ) : tables.length === 0 ? (
        /* Estado vacío cuando no hay mesas creadas */
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
            // Buscar la mesa vinculada para mostrar su nombre
            const linkedTable = table.linkedTableId ? tables.find(t => t.id === table.linkedTableId) : null;
            return (
              <div
                key={table.id}
                className={`rounded-2xl border-2 p-4 flex flex-col gap-3 transition ${cfg.color} ${table.linkedTableId ? 'border-dashed' : ''}`}
              >
                {/* Nombre de la mesa y punto indicador de estado */}
                {/* Table name and status */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{table.name}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                </div>
                {/* Capacidad y mesa vinculada (si existe) */}
                <div className="text-xs text-gray-400">
                  Capacidad: {table.capacity} personas
                  {linkedTable && (
                    <div className="text-[#A3B31A] mt-1 font-semibold flex items-center gap-1">
                      <span>🔗</span> Unida con: {linkedTable.name}
                    </div>
                  )}
                </div>
                {/* Badge de estado actual */}
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${cfg.dot} bg-opacity-20 text-white`}>
                  {cfg.label}
                </div>

                {/* Botones para cambiar a otros estados disponibles */}
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

                {/* Botones de editar y eliminar */}
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

      {/* ===================== Modal de creación/edición de mesa ===================== */}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">
              {editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Nombre de la mesa */}
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
              {/* Campo: Capacidad de personas */}
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
              {/* Selector: Vincular con otra mesa (para mesas unidas físicamente) */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Unir a otra mesa</label>
                <select
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.linkedTableId}
                  onChange={(e) => setFormData({ ...formData, linkedTableId: e.target.value })}
                >
                  <option value="">Ninguna</option>
                  {/* Excluir la mesa actual de la lista de vinculación */}
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
