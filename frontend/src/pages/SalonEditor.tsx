/**
 * ============================================================
 * SalonEditor.tsx
 * ============================================================
 * Editor interactivo del salón.
 * Permite definir una cuadrícula (grid) y asignar áreas (ej: Interior, Patio)
 * con colores, así como arrastrar y soltar elementos (mesas, sillas).
 * Sirve como base visual para la organización de mesas.
 * 
 * Tabla(s) relacionada(s): SalonLayout, Area (aunque aquí el estado es local por ahora)
 * Módulo: Frontend / Páginas
 * ============================================================
 */
import { useMemo, useState } from 'react';

/** Coordenadas de una celda en la cuadrícula */
type GridCell = {
  x: number;
  y: number;
};

/** Define un área del salón (grupo de celdas pintadas de un color) */
type Area = {
  id: string;
  name: string;
  color: string;
  cells: GridCell[];
};

/** Elemento colocado en la cuadrícula (mesa o silla) */
type PlacedItem = {
  id: string;
  type: 'table' | 'chair';
  x: number;
  y: number;
};

/**
 * Genera el array de celdas (x, y) en base a filas y columnas.
 * @param rows - Cantidad de filas
 * @param columns - Cantidad de columnas
 * @returns Array de coordenadas GridCell
 */
const createGrid = (rows: number, columns: number) => {
  const cells: GridCell[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      cells.push({ x, y });
    }
  }
  return cells;
};

/**
 * Componente principal del Editor de Salón.
 */
const SalonEditor = () => {
  // Dimensiones de la cuadrícula
  const [rows] = useState(8);
  const [columns] = useState(12);
  
  // Celdas actualmente seleccionadas por el usuario
  const [selectedCells, setSelectedCells] = useState<GridCell[]>([]);
  // Datos del formulario de nueva área
  const [areaName, setAreaName] = useState('Interior');
  const [areaColor, setAreaColor] = useState('#A3B31A');
  // Lista de áreas creadas
  const [areas, setAreas] = useState<Area[]>([]);
  // Elementos arrastrados a la cuadrícula
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  // Elemento siendo arrastrado actualmente (drag & drop)
  const [dragType, setDragType] = useState<'table' | 'chair' | null>(null);

  // Memoización de la matriz de celdas para evitar recalcularla en cada render
  const cells = useMemo(() => createGrid(rows, columns), [rows, columns]);

  /**
   * Busca si una celda específica pertenece a alguna de las áreas creadas.
   * @param cell - Celda a buscar
   * @returns El objeto Area o undefined
   */
  const getAreaForCell = (cell: GridCell) => {
    return areas.find((area) => area.cells.some((c) => c.x === cell.x && c.y === cell.y));
  };

  /**
   * Alterna la selección de una celda en la cuadrícula.
   * Si ya está seleccionada, la quita; si no, la agrega.
   */
  const toggleCell = (cell: GridCell) => {
    const index = selectedCells.findIndex((selected) => selected.x === cell.x && selected.y === cell.y);
    if (index >= 0) {
      setSelectedCells(selectedCells.filter((_, i) => i !== index));
      return;
    }
    setSelectedCells([...selectedCells, cell]);
  };

  /**
   * Crea una nueva área utilizando las celdas actualmente seleccionadas
   * y los valores de nombre/color del formulario.
   */
  const addArea = () => {
    if (!selectedCells.length) {
      return;
    }

    const nextArea: Area = {
      id: `${areaName}-${Date.now()}`,
      name: areaName,
      color: areaColor,
      cells: selectedCells
    };

    setAreas([...areas, nextArea]);
    setSelectedCells([]); // Limpia la selección
  };

  /**
   * Elimina un área existente por su ID.
   */
  const removeArea = (areaId: string) => {
    setAreas(areas.filter((area) => area.id !== areaId));
  };

  /** Evento que inicia el arrastre (Drag) de un elemento (mesa o silla) */
  const onDragStart = (type: 'table' | 'chair') => {
    setDragType(type);
  };

  /** 
   * Evento que se ejecuta al soltar (Drop) un elemento sobre una celda.
   * Registra el elemento en la coordenada correspondiente.
   */
  const onDrop = (event: React.DragEvent<HTMLDivElement>, cell: GridCell) => {
    event.preventDefault();
    if (!dragType) return;

    const nextItem: PlacedItem = {
      id: `${dragType}-${cell.x}-${cell.y}-${Date.now()}`,
      type: dragType,
      x: cell.x,
      y: cell.y
    };

    setPlacedItems((current) => [...current, nextItem]);
    setDragType(null); // Resetea el arrastre
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#A3B31A]/20 bg-[#24303A] p-6 shadow-glow">
        <h2 className="text-2xl font-semibold text-[#A3B31A]">Salon Editor</h2>
        <p className="mt-2 text-slate-300 max-w-2xl">
          Create colored areas, place tables and chairs, and visualize the salon grid.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-[#A3B31A]/20 bg-[#24303A] p-6 shadow-glow">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#39FF8B]">Create Area</h3>
              <label className="mt-4 block text-sm text-slate-300">Area name</label>
              <input
                value={areaName}
                onChange={(event) => setAreaName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-600 bg-[#1F2A31] p-3 text-white outline-none"
              />
              <label className="mt-4 block text-sm text-slate-300">Color</label>
              <input
                type="color"
                value={areaColor}
                onChange={(event) => setAreaColor(event.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-slate-600 bg-[#1F2A31] p-2"
              />
              <button
                type="button"
                onClick={addArea}
                className="mt-4 w-full rounded-2xl bg-[#A3B31A] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#8aa220]"
              >
                Save area
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#39FF8B]">Drag & Drop</h3>
              <div className="mt-4 grid gap-3">
                {['table', 'chair'].map((type) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={() => onDragStart(type as 'table' | 'chair')}
                    className="cursor-grab rounded-2xl border border-slate-600 bg-[#1F2A31] p-4 text-center text-white"
                  >
                    <span className="block text-base font-semibold capitalize">{type}</span>
                    <span className="mt-2 block text-sm text-slate-400">Drag to grid</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#39FF8B]">Areas</h3>
              <div className="mt-4 space-y-3">
                {areas.length === 0 ? (
                  <p className="text-slate-400">No areas created yet.</p>
                ) : (
                  areas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-700 bg-[#1C2730] p-3"
                    >
                      <div>
                        <div className="font-semibold text-white">{area.name}</div>
                        <div className="text-sm text-slate-400">{area.cells.length} cells</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeArea(area.id)}
                        className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-2xl border border-[#A3B31A]/20 bg-[#24303A] p-6 shadow-glow">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl bg-[#1F2A31] px-4 py-3 text-sm text-slate-300">
              Selected cells: {selectedCells.length}
            </div>
            <div className="rounded-2xl bg-[#1F2A31] px-4 py-3 text-sm text-slate-300">
              Placed items: {placedItems.length}
            </div>
          </div>

          <div
            className="grid gap-1 rounded-3xl border border-slate-700 bg-[#1D2932] p-2"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {cells.map((cell) => {
              const selected = selectedCells.some((item) => item.x === cell.x && item.y === cell.y);
              const area = getAreaForCell(cell);
              const placed = placedItems.find((item) => item.x === cell.x && item.y === cell.y);

              return (
                <div
                  key={`${cell.x}-${cell.y}`}
                  onClick={() => toggleCell(cell)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onDrop(event, cell)}
                  className={`relative aspect-square rounded-2xl border border-slate-700 transition ${
                    selected ? 'border-[#39FF8B] bg-[#2F4E2C]/30' : 'bg-[#24303A]'
                  }`}
                >
                  {area ? (
                    <div
                      className="absolute inset-0 rounded-2xl opacity-80"
                      style={{ backgroundColor: area.color }}
                    />
                  ) : null}
                  <div className="relative flex h-full flex-col items-center justify-center text-xs text-slate-300">
                    <span>{cell.x + 1}x{cell.y + 1}</span>
                    {placed ? (
                      <span className="mt-1 rounded-full bg-[#39FF8B]/20 px-2 py-1 text-[10px] font-semibold text-[#39FF8B]">
                        {placed.type}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalonEditor;
