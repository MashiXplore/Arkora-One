// src/frontend/components/modules/informes/InformesFilters.tsx
// Barra de filtros específica para el módulo de Informes Técnicos
// Skill: react-modernization

'use client';

import { Input, Select, Button } from '@/frontend/components/ui';
import { useAgencias } from '@/frontend/hooks/useFuncionarios';
import { Search, RotateCcw } from 'lucide-react';
import type { Agencia } from '@/types/funcionario.types';

export interface InformesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  tipoFilter: string;
  onTipoChange: (value: string) => void;
  agenciaFilter: string;
  onAgenciaChange: (value: string) => void;
  onReset: () => void;
}

export function InformesFilters({
  search,
  onSearchChange,
  tipoFilter,
  onTipoChange,
  agenciaFilter,
  onAgenciaChange,
  onReset,
}: InformesFiltersProps) {
  const { data: agenciasData } = useAgencias();
  const agencias =
    agenciasData && 'data' in agenciasData && Array.isArray(agenciasData.data)
      ? (agenciasData.data as Agencia[])
      : [];

  const tipoOptions = [
    { value: '', label: 'Todas las clasificaciones' },
    { value: 'Grave', label: 'Reparaciones Graves' },
    { value: 'Piezas', label: 'Cambio de Piezas / Repuestos' },
    { value: 'Baja', label: 'Dictamen de Baja / Obsolescencia' },
    { value: 'Diagnóstico', label: 'Evaluación y Diagnóstico' },
  ];

  const agenciaOptions = [
    { value: '', label: 'Todas las agencias' },
    ...agencias.map((ag) => ({
      value: String(ag.id),
      label: ag.nombre,
    })),
  ];

  const hasActiveFilters = Boolean(search || tipoFilter || agenciaFilter);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-center">
        {/* Buscador */}
        <div className="lg:col-span-5">
          <Input
            id="informes-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            className="h-8 text-xs"
          />
        </div>

        {/* Filtro Clasificación */}
        <div className="lg:col-span-3">
          <Select
            id="filtro-tipo-informe"
            options={tipoOptions}
            value={tipoFilter}
            onChange={(e) => onTipoChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Filtro Agencia */}
        <div className="lg:col-span-3">
          <Select
            id="filtro-agencia-informe"
            options={agenciaOptions}
            value={agenciaFilter}
            onChange={(e) => onAgenciaChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Botón Reset */}
        <div className="lg:col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            title="Limpiar filtros"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
