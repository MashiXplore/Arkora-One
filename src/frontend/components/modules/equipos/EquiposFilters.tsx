// src/frontend/components/modules/equipos/EquiposFilters.tsx
// Barra de filtros específica para el módulo de Equipos
// Skill: react-modernization

'use client';

import { Input, Select, Button } from '@/frontend/components/ui';
import { Search, RotateCcw } from 'lucide-react';
import { useMarcas, useTiposEquipo, useModelos } from '@/frontend/hooks/useEquipos';

export interface EquiposFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  marcaFilter: string;
  onMarcaChange: (value: string) => void;
  tipoFilter: string;
  onTipoChange: (value: string) => void;
  modeloFilter: string;
  onModeloChange: (value: string) => void;
  estadoFilter: string;
  onEstadoChange: (value: string) => void;
  onReset: () => void;
}

export function EquiposFilters({
  search,
  onSearchChange,
  marcaFilter,
  onMarcaChange,
  tipoFilter,
  onTipoChange,
  modeloFilter,
  onModeloChange,
  estadoFilter,
  onEstadoChange,
  onReset,
}: EquiposFiltersProps) {
  const { data: marcasData } = useMarcas();
  const selectedMarcaId = marcaFilter ? Number(marcaFilter) : undefined;
  const selectedTipoId = tipoFilter ? Number(tipoFilter) : undefined;
  const { data: tiposData } = useTiposEquipo(selectedMarcaId);
  const { data: modelosData } = useModelos({ marcaId: selectedMarcaId, tipoEquipoId: selectedTipoId });

  const marcas =
    marcasData && 'success' in marcasData && marcasData.success && Array.isArray(marcasData.data)
      ? marcasData.data
      : [];

  const tipos =
    tiposData && 'success' in tiposData && tiposData.success && Array.isArray(tiposData.data)
      ? tiposData.data
      : [];

  const modelos =
    modelosData && 'success' in modelosData && modelosData.success && Array.isArray(modelosData.data)
      ? modelosData.data
      : [];

  const hasActiveFilters = Boolean(
    search || marcaFilter || tipoFilter || modeloFilter || estadoFilter
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
        {/* Búsqueda */}
        <div className="lg:col-span-1">
          <Input
            id="filter-search-equipo"
            placeholder="Buscar por código (ej. 05-06795), serie, persona..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Marca */}
        <div>
          <Select
            id="filter-marca"
            value={marcaFilter}
            onChange={(e) => {
              onMarcaChange(e.target.value);
              onTipoChange('');
              onModeloChange('');
            }}
            options={[
              { value: '', label: 'Todas las Marcas' },
              ...marcas.map((m) => ({ value: String(m.id), label: m.nombre })),
            ]}
          />
        </div>

        {/* Tipo de Equipo */}
        <div>
          <Select
            id="filter-tipo"
            value={tipoFilter}
            onChange={(e) => {
              onTipoChange(e.target.value);
              onModeloChange('');
            }}
            options={[
              { value: '', label: 'Todos los Tipos' },
              ...tipos.map((t) => ({ value: String(t.id), label: t.nombre })),
            ]}
          />
        </div>

        {/* Modelo */}
        <div>
          <Select
            id="filter-modelo"
            value={modeloFilter}
            onChange={(e) => onModeloChange(e.target.value)}
            options={[
              { value: '', label: 'Todos los Modelos' },
              ...modelos.map((mod) => ({ value: String(mod.id), label: mod.nombre })),
            ]}
          />
        </div>

        {/* Estado Operativo + Reset */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              id="filter-estado-operativo"
              value={estadoFilter}
              onChange={(e) => onEstadoChange(e.target.value)}
              options={[
                { value: '', label: 'Todos los Estados' },
                { value: 'operativo', label: 'Operativo' },
                { value: 'en_mantenimiento', label: 'En Mantenimiento' },
                { value: 'de_baja', label: 'De Baja' },
                { value: 'en_desuso', label: 'En Desuso' },
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
