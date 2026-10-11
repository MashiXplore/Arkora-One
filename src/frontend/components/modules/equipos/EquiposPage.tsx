// src/frontend/components/modules/equipos/EquiposPage.tsx
// Vista contenedora principal del módulo de Equipos e Inventario TI
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { EquiposMetrics } from './EquiposMetrics';
import { EquiposFilters } from './EquiposFilters';
import { EquiposTable } from './EquiposTable';
import { EquipoCreateModal } from './EquipoCreateModal';
import { EquipoEditModal } from './EquipoEditModal';
import { MarcasTab } from './MarcasTab';
import { TiposEquipoTab } from './TiposEquipoTab';
import { ModelosTab } from './ModelosTab';
import { Breadcrumbs, Button, Tabs } from '@/frontend/components/ui';
import { Plus, Laptop, Layers, Cpu } from 'lucide-react';
import type { EquipoWithRelations } from '@/types/equipo.types';

export function EquiposPage() {
  const [activeTab, setActiveTab] = useState('equipos');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<EquipoWithRelations | null>(null);

  // Filtros de Equipos
  const [search, setSearch] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [modeloFilter, setModeloFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const handleResetFilters = () => {
    setSearch('');
    setMarcaFilter('');
    setTipoFilter('');
    setModeloFilter('');
    setEstadoFilter('');
  };

  const tabs = [
    { id: 'equipos', label: 'Equipos', icon: <Laptop className="w-4 h-4" /> },
    { id: 'marcas', label: 'Marcas', icon: <Layers className="w-4 h-4" /> },
    { id: 'tipos', label: 'Tipos de Equipo', icon: <Cpu className="w-4 h-4" /> },
    { id: 'modelos', label: 'Modelos', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Botón de Acción Principal */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Equipos' }]} />

        {activeTab === 'equipos' && (
          <Button
            id="btn-new-equipo"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Nuevo Equipo
          </Button>
        )}
      </div>

      {/* Métricas del módulo con gráficos visuales */}
      <EquiposMetrics />

      {/* Navegación por pestañas dentro del panel del módulo */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Pestaña 1: Equipos */}
      {activeTab === 'equipos' && (
        <div className="space-y-3">
          <EquiposFilters
            search={search}
            onSearchChange={setSearch}
            marcaFilter={marcaFilter}
            onMarcaChange={setMarcaFilter}
            tipoFilter={tipoFilter}
            onTipoChange={setTipoFilter}
            modeloFilter={modeloFilter}
            onModeloChange={setModeloFilter}
            estadoFilter={estadoFilter}
            onEstadoChange={setEstadoFilter}
            onReset={handleResetFilters}
          />
          <EquiposTable
            search={search}
            marcaFilter={marcaFilter}
            tipoFilter={tipoFilter}
            modeloFilter={modeloFilter}
            estadoFilter={estadoFilter}
            onEdit={(eq) => setEditingEquipo(eq)}
          />
        </div>
      )}

      {/* Pestaña 2: Marcas */}
      {activeTab === 'marcas' && <MarcasTab />}

      {/* Pestaña 3: Tipos de Equipo */}
      {activeTab === 'tipos' && <TiposEquipoTab />}

      {/* Pestaña 4: Modelos */}
      {activeTab === 'modelos' && <ModelosTab />}

      {/* Modal de Creación */}
      <EquipoCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal de Edición */}
      <EquipoEditModal
        isOpen={Boolean(editingEquipo)}
        equipo={editingEquipo}
        onClose={() => setEditingEquipo(null)}
      />
    </div>
  );
}
