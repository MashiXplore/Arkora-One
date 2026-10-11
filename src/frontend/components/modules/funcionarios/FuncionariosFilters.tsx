// src/frontend/components/modules/funcionarios/FuncionariosFilters.tsx
// Barra de filtros específica para el módulo de Funcionarios
// Skill: react-modernization

'use client';

import { Input, Select, Button } from '@/frontend/components/ui';
import { Search, RotateCcw } from 'lucide-react';
import { useSucursales, useAgencias, useCargos } from '@/frontend/hooks/useFuncionarios';

export interface FuncionariosFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sucursalFilter: string;
  onSucursalChange: (value: string) => void;
  agenciaFilter: string;
  onAgenciaChange: (value: string) => void;
  cargoFilter: string;
  onCargoChange: (value: string) => void;
  estadoFilter: string;
  onEstadoChange: (value: string) => void;
  onReset: () => void;
}

export function FuncionariosFilters({
  search,
  onSearchChange,
  sucursalFilter,
  onSucursalChange,
  agenciaFilter,
  onAgenciaChange,
  cargoFilter,
  onCargoChange,
  estadoFilter,
  onEstadoChange,
  onReset,
}: FuncionariosFiltersProps) {
  const { data: sucursalesData } = useSucursales();
  const selectedSucursalId = sucursalFilter ? Number(sucursalFilter) : undefined;
  const { data: agenciasData } = useAgencias(selectedSucursalId);
  const { data: cargosData } = useCargos();

  const sucursales =
    sucursalesData && 'success' in sucursalesData && sucursalesData.success && Array.isArray(sucursalesData.data)
      ? sucursalesData.data
      : [];

  const agencias =
    agenciasData && 'success' in agenciasData && agenciasData.success && Array.isArray(agenciasData.data)
      ? agenciasData.data
      : [];

  const cargos =
    cargosData && 'success' in cargosData && cargosData.success && Array.isArray(cargosData.data)
      ? cargosData.data
      : [];

  const hasActiveFilters = Boolean(
    search || sucursalFilter || agenciaFilter || cargoFilter || estadoFilter
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
        {/* Búsqueda en vivo */}
        <div className="lg:col-span-1">
          <Input
            id="filter-search-funcionario"
            placeholder="Buscar por nombre, correo..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Sucursal */}
        <div>
          <Select
            id="filter-sucursal"
            value={sucursalFilter}
            onChange={(e) => {
              onSucursalChange(e.target.value);
              onAgenciaChange(''); // Limpiar agencia al cambiar sucursal
            }}
            options={[
              { value: '', label: 'Todas las Sucursales' },
              ...sucursales.map((s) => ({ value: String(s.id), label: s.nombre })),
            ]}
          />
        </div>

        {/* Agencia */}
        <div>
          <Select
            id="filter-agencia"
            value={agenciaFilter}
            onChange={(e) => onAgenciaChange(e.target.value)}
            options={[
              { value: '', label: 'Todas las Agencias' },
              ...agencias.map((a) => ({ value: String(a.id), label: a.nombre })),
            ]}
          />
        </div>

        {/* Cargo */}
        <div>
          <Select
            id="filter-cargo"
            value={cargoFilter}
            onChange={(e) => onCargoChange(e.target.value)}
            options={[
              { value: '', label: 'Todos los Cargos' },
              ...cargos.map((c) => ({ value: String(c.id), label: c.nombre })),
            ]}
          />
        </div>

        {/* Estado + Reset */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              id="filter-estado"
              value={estadoFilter}
              onChange={(e) => onEstadoChange(e.target.value)}
              options={[
                { value: '', label: 'Todos los Estados' },
                { value: 'true', label: 'Activos' },
                { value: 'false', label: 'Inactivos' },
              ]}
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              title="Restablecer filtros"
              className="px-2"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
