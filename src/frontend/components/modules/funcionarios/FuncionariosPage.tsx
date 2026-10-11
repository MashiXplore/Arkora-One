// src/frontend/components/modules/funcionarios/FuncionariosPage.tsx
// Vista contenedora principal del módulo de Funcionarios y Estructura Organizacional
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { FuncionariosMetrics } from './FuncionariosMetrics';
import { FuncionariosFilters } from './FuncionariosFilters';
import { FuncionariosTable } from './FuncionariosTable';
import { FuncionarioCreateModal } from './FuncionarioCreateModal';
import { FuncionarioEditModal } from './FuncionarioEditModal';
import { SucursalesTab } from './SucursalesTab';
import { AgenciasTab } from './AgenciasTab';
import { CargosTab } from './CargosTab';
import { Breadcrumbs, Button, Tabs } from '@/frontend/components/ui';
import { UserPlus, Users, Building2, Building, Briefcase } from 'lucide-react';
import type { FuncionarioWithRelations } from '@/types/funcionario.types';

export function FuncionariosPage() {
  const [activeTab, setActiveTab] = useState('funcionarios');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<FuncionarioWithRelations | null>(null);

  // Filtros de Funcionarios
  const [search, setSearch] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [agenciaFilter, setAgenciaFilter] = useState('');
  const [cargoFilter, setCargoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const handleResetFilters = () => {
    setSearch('');
    setSucursalFilter('');
    setAgenciaFilter('');
    setCargoFilter('');
    setEstadoFilter('');
  };

  const tabs = [
    { id: 'funcionarios', label: 'Funcionarios', icon: <Users className="w-4 h-4" /> },
    { id: 'sucursales', label: 'Sucursales', icon: <Building2 className="w-4 h-4" /> },
    { id: 'agencias', label: 'Agencias', icon: <Building className="w-4 h-4" /> },
    { id: 'cargos', label: 'Cargos y Puestos', icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Botón de Acción Principal */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Funcionarios' }]} />

        {activeTab === 'funcionarios' && (
          <Button
            id="btn-new-funcionario"
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Nuevo Funcionario
          </Button>
        )}
      </div>

      {/* Métricas visuales del módulo */}
      <FuncionariosMetrics />

      {/* Navegación por pestañas dentro del panel del módulo */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Pestaña 1: Funcionarios */}
      {activeTab === 'funcionarios' && (
        <div className="space-y-3">
          <FuncionariosFilters
            search={search}
            onSearchChange={setSearch}
            sucursalFilter={sucursalFilter}
            onSucursalChange={setSucursalFilter}
            agenciaFilter={agenciaFilter}
            onAgenciaChange={setAgenciaFilter}
            cargoFilter={cargoFilter}
            onCargoChange={setCargoFilter}
            estadoFilter={estadoFilter}
            onEstadoChange={setEstadoFilter}
            onReset={handleResetFilters}
          />
          <FuncionariosTable
            search={search}
            sucursalFilter={sucursalFilter}
            agenciaFilter={agenciaFilter}
            cargoFilter={cargoFilter}
            estadoFilter={estadoFilter}
            onEdit={(func) => setEditingFuncionario(func)}
          />
        </div>
      )}

      {/* Pestaña 2: Sucursales */}
      {activeTab === 'sucursales' && <SucursalesTab />}

      {/* Pestaña 3: Agencias */}
      {activeTab === 'agencias' && <AgenciasTab />}

      {/* Pestaña 4: Cargos */}
      {activeTab === 'cargos' && <CargosTab />}

      {/* Modal de Creación */}
      <FuncionarioCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal de Edición */}
      <FuncionarioEditModal
        isOpen={Boolean(editingFuncionario)}
        funcionario={editingFuncionario}
        onClose={() => setEditingFuncionario(null)}
      />
    </div>
  );
}
