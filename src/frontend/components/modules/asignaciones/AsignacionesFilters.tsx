// src/frontend/components/modules/asignaciones/AsignacionesFilters.tsx
// Barra de filtros específica para el módulo de Asignaciones y Custodia de Equipos
// Skill: react-modernization

'use client';

import { Input, Select, Button } from '@/frontend/components/ui';
import { useTiposEquipo } from '@/frontend/hooks/useEquipos';
import { useAgencias } from '@/frontend/hooks/useFuncionarios';
import { Search, RotateCcw, Filter } from 'lucide-react';
import type { TipoEquipo } from '@/types/equipo.types';
import type { Agencia } from '@/types/funcionario.types';

export interface AsignacionesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  custodiaFilter: string;
  onCustodiaChange: (value: string) => void;
  agenciaFilter: string;
  onAgenciaChange: (value: string) => void;
  tipoEquipoFilter: string;
  onTipoEquipoChange: (value: string) => void;
  onReset: () => void;
}

export function AsignacionesFilters({
  search,
  onSearchChange,
  custodiaFilter,
  onCustodiaChange,
  agenciaFilter,
  onAgenciaChange,
  tipoEquipoFilter,
  onTipoEquipoChange,
  onReset,
}: AsignacionesFiltersProps) {
  const { data: agenciasData } = useAgencias();
  const { data: tiposData } = useTiposEquipo();

  const agencias =
    agenciasData && 'data' in agenciasData && Array.isArray(agenciasData.data)
      ? (agenciasData.data as Agencia[])
      : [];

  const tipos =
    tiposData && 'data' in tiposData && Array.isArray(tiposData.data)
      ? (tiposData.data as TipoEquipo[])
      : [];

  const custodiaOptions = [
    { value: '', label: 'Todos los estados de custodia' },
    { value: 'asignado', label: 'Asignados a Funcionario' },
    { value: 'disponible', label: 'En Almacén / Disponibles' },
  ];

  const agenciaOptions = [
    { value: '', label: 'Todas las agencias' },
    ...agencias.map((ag) => ({
      value: String(ag.id),
      label: ag.nombre,
    })),
  ];

  const tipoOptions = [
    { value: '', label: 'Todos los tipos de equipo' },
    ...tipos.map((tp) => ({
      value: String(tp.id),
      label: tp.nombre,
    })),
  ];

  const hasActiveFilters = Boolean(search || custodiaFilter || agenciaFilter || tipoEquipoFilter);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-center">
        {/* Buscador */}
        <div className="lg:col-span-4">
          <Input
            id="asignaciones-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            className="h-8 text-xs"
          />
        </div>

        {/* Filtro Custodia */}
        <div className="lg:col-span-3">
          <Select
            id="filtro-custodia"
            options={custodiaOptions}
            value={custodiaFilter}
            onChange={(e) => onCustodiaChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Filtro Agencia */}
        <div className="lg:col-span-2">
          <Select
            id="filtro-agencia"
            options={agenciaOptions}
            value={agenciaFilter}
            onChange={(e) => onAgenciaChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Filtro Tipo de Equipo */}
        <div className="lg:col-span-2">
          <Select
            id="filtro-tipo-equipo"
            options={tipoOptions}
            value={tipoEquipoFilter}
            onChange={(e) => onTipoEquipoChange(e.target.value)}
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
