// src/frontend/components/modules/configuracion/FirmasOrdenesTab.tsx
// Pestaña para gestionar la lista de firmas que aparecen en las Órdenes de Servicio
// Skill: react-modernization

'use client';

import { useState, useEffect } from 'react';
import { Button, Input, showToast } from '@/frontend/components/ui';
import { Plus, Trash2, ShieldCheck, ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import type { FirmaConfig } from '@/types/config.types';

export interface FirmasOrdenesTabProps {
  initialFirmas: FirmaConfig[];
  onSave: (firmas: FirmaConfig[]) => void;
}

export function FirmasOrdenesTab({ initialFirmas, onSave }: FirmasOrdenesTabProps) {
  const [firmas, setFirmas] = useState<FirmaConfig[]>(initialFirmas);

  useEffect(() => {
    setFirmas(initialFirmas);
  }, [initialFirmas]);

  const handleAddFirma = () => {
    if (firmas.length >= 6) {
      showToast.error('Se permite un máximo de 6 firmas por documento.');
      return;
    }

    const nuevaFirma: FirmaConfig = {
      id: `ord-${Date.now()}`,
      cargo: 'Nueva Firma de Autorización',
      nombre: '',
      aclaracion: 'Firma y Sello',
    };

    const updated = [...firmas, nuevaFirma];
    setFirmas(updated);
    onSave(updated);
    showToast.success('Firma agregada. Configura el cargo y aclaración.');
  };

  const handleRemoveFirma = (id: string) => {
    if (firmas.length <= 1) {
      showToast.error('Debe haber al menos 1 firma en la orden de servicio.');
      return;
    }
    const updated = firmas.filter((f) => f.id !== id);
    setFirmas(updated);
    onSave(updated);
    showToast.success('Firma eliminada.');
  };

  const handleUpdateField = (id: string, field: keyof FirmaConfig, value: string) => {
    const updated = firmas.map((f) => (f.id === id ? { ...f, [field]: value } : f));
    setFirmas(updated);
    onSave(updated);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4 text-xs">
      {/* Encabezado descriptivo */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Firmantes Oficiales en Ficha de Orden de Servicio</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Define cuántas firmas y qué cargos deben figurar en la ficha impresa y el archivo PDF (ej. 2, 3 o 4 funcionarios).
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddFirma}
        >
          Agregar Firmante
        </Button>
      </div>

      {/* Lista de firmas interactivas */}
      <div className="space-y-3">
        {firmas.map((firma, idx) => (
          <div
            key={firma.id}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                {idx + 1}
              </span>
              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs block">
                  Posición #{idx + 1}
                </span>
                <span className="text-[10px] text-slate-400">
                  Aparecerá en la columna {idx + 1} de la ficha
                </span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
              {/* Cargo / Título del Firmante */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                  Rol / Cargo del Firmante
                </label>
                <input
                  type="text"
                  value={firma.cargo}
                  onChange={(e) => handleUpdateField(firma.id, 'cargo', e.target.value)}
                  placeholder="Ej: Funcionario Solicitante"
                  className="w-full h-8 text-xs px-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Aclaración / Leyenda */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                  Leyenda / Requisito
                </label>
                <input
                  type="text"
                  value={firma.aclaracion}
                  onChange={(e) => handleUpdateField(firma.id, 'aclaracion', e.target.value)}
                  placeholder="Ej: Firma y C.I."
                  className="w-full h-8 text-xs px-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Nombre o Área opcional */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                  Dependencia / Nota (Opcional)
                </label>
                <input
                  type="text"
                  value={firma.nombre || ''}
                  onChange={(e) => handleUpdateField(firma.id, 'nombre', e.target.value)}
                  placeholder="Ej: Unidad de TI o Vacío"
                  className="w-full h-8 text-xs px-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Acción Eliminar */}
            <div className="pt-2 sm:pt-0 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFirma(firma.id)}
                title="Eliminar este firmante"
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center justify-between">
        <span>Total de firmantes configurados para Órdenes: <strong>{firmas.length}</strong></span>
        <span>Los cambios se aplican automáticamente a la vista y descarga PDF.</span>
      </div>
    </div>
  );
}
