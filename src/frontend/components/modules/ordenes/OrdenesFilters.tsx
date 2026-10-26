// src/frontend/components/modules/ordenes/OrdenesFilters.tsx
// Barra de filtros para el módulo de Órdenes de Servicio
// Skill: react-modernization

'use client';

import { Search, RotateCcw } from 'lucide-react';
import { Input, Select, Button } from '@/frontend/components/ui';

interface OrdenesFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  estadoFilter: string;
  onEstadoChange: (val: string) => void;
  tipoFilter: string;
  onTipoChange: (val: string) => void;
  prioridadFilter: string;
  onPrioridadChange: (val: string) => void;
  onReset: () => void;
}

export function OrdenesFilters({
  search,
  onSearchChange,
  estadoFilter,
  onEstadoChange,
  tipoFilter,
  onTipoChange,
  prioridadFilter,
  onPrioridadChange,
  onReset,
}: OrdenesFiltersProps) {
  const hasActiveFilters = Boolean(search || estadoFilter || tipoFilter || prioridadFilter);

  const estadoOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'creado', label: 'Creado' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'finalizado', label: 'Finalizado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  const tipoOptions = [
    { value: '', label: 'Todos los servicios' },
    { value: 'reparacion', label: 'Reparación' },
    { value: 'mantenimiento_preventivo', label: 'Mant. Preventivo' },
    { value: 'mantenimiento_correctivo', label: 'Mant. Correctivo' },
    { value: 'diagnostico', label: 'Diagnóstico' },
    { value: 'instalacion', label: 'Instalación' },
  ];

  const prioridadOptions = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-end">
        {/* Búsqueda en vivo */}
        <div className="lg:col-span-2">
          <Input
            id="search-ordenes"
            placeholder="Buscar por N° orden, etiqueta, solicitante..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Filtro Estado */}
        <div>
          <Select
            id="filter-estado"
            options={estadoOptions}
            value={estadoFilter}
            onChange={(e) => onEstadoChange(e.target.value)}
          />
        </div>

        {/* Filtro Tipo de Servicio */}
        <div>
          <Select
            id="filter-tipo"
            options={tipoOptions}
            value={tipoFilter}
            onChange={(e) => onTipoChange(e.target.value)}
          />
        </div>

        {/* Filtro Prioridad + Reset */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              id="filter-prioridad"
              options={prioridadOptions}
              value={prioridadFilter}
              onChange={(e) => onPrioridadChange(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="md"
              onClick={onReset}
              title="Limpiar todos los filtros"
              className="shrink-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
