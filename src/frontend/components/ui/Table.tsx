// src/frontend/components/ui/Table.tsx
// Componente atómico de Tabla con personalización de columnas y bordes nítidos
// Skill: react-modernization

'use client';

import React, { useState } from 'react';
import { Loader2, Columns, Check } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  id?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  allowColumnToggle?: boolean;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No hay registros para mostrar',
  allowColumnToggle = true,
}: TableProps<T>) {
  // Estado de columnas visibles (por defecto todas están visibles)
  const [hiddenColumnIds, setHiddenColumnIds] = useState<string[]>([]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const getColId = (col: Column<T>, idx: number) => col.id || col.header || String(idx);

  const visibleColumns = columns.filter(
    (col, idx) => !hiddenColumnIds.includes(getColId(col, idx))
  );

  const toggleColumnVisibility = (colId: string) => {
    setHiddenColumnIds((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
      {/* Selector de Columnas Personalizables */}
      {allowColumnToggle && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-300 dark:border-slate-800 flex items-center justify-end">
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-colors"
              title="Personalizar columnas visibles"
            >
              <Columns className="w-3.5 h-3.5 text-blue-500" />
              <span>Columnas</span>
            </button>

            {isColumnDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsColumnDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-300 dark:border-slate-800 p-2 z-40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Mostrar Columnas
                  </span>
                  {columns.map((col, idx) => {
                    const colId = getColId(col, idx);
                    const isVisible = !hiddenColumnIds.includes(colId);

                    return (
                      <button
                        key={colId}
                        onClick={() => toggleColumnVisibility(colId)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isVisible
                            ? 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800'
                            : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="truncate">{col.header}</span>
                        {isVisible && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabla Principal */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-300 dark:border-slate-800">
            <tr>
              {visibleColumns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumns.length} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-xs font-medium">Cargando información...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="py-10 text-center text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {visibleColumns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-3 ${col.className || ''}`}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? (row[col.accessorKey] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
