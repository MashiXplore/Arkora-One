// src/frontend/components/modules/ordenes/OrdenesPage.tsx
// Vista contenedora principal del módulo de Órdenes de Servicio, Asignaciones e Informes
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { OrdenesMetrics } from './OrdenesMetrics';
import { OrdenesFilters } from './OrdenesFilters';
import { OrdenesTable } from './OrdenesTable';
import { OrdenCreateModal } from './OrdenCreateModal';
import { OrdenEditModal } from './OrdenEditModal';
import { OrdenDetailModal } from './OrdenDetailModal';
import { AsignacionesTab } from './AsignacionesTab';
import { InformesTab } from './InformesTab';
import { InformeCreateModal } from './InformeCreateModal';
import { InformeDetailModal } from './InformeDetailModal';
import { Breadcrumbs, Button, Tabs } from '@/frontend/components/ui';
import { Plus, Wrench, UserCheck, FileCheck2 } from 'lucide-react';
import type { OrdenWithRelations } from '@/types/orden.types';

export function OrdenesPage() {
  const [activeTab, setActiveTab] = useState('ordenes');

  // Modales de Órdenes
  const [isCreateOrdenOpen, setIsCreateOrdenOpen] = useState(false);
  const [editingOrden, setEditingOrden] = useState<OrdenWithRelations | null>(null);
  const [detailOrden, setDetailOrden] = useState<OrdenWithRelations | null>(null);

  // Modales de Informes
  const [isCreateInformeOpen, setIsCreateInformeOpen] = useState(false);
  const [informeDefaultOrden, setInformeDefaultOrden] = useState<OrdenWithRelations | null>(null);
  const [detailInformeId, setDetailInformeId] = useState<number | null>(null);

  // Filtros de Órdenes
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [prioridadFilter, setPrioridadFilter] = useState('');

  const handleResetFilters = () => {
    setSearch('');
    setEstadoFilter('');
    setTipoFilter('');
    setPrioridadFilter('');
  };

  const tabs = [
    { id: 'ordenes', label: 'Órdenes de Servicio', icon: <Wrench className="w-4 h-4" /> },
    { id: 'asignaciones', label: 'Asignaciones', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'informes', label: 'Informes Técnicos', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Botón de Acción Principal */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Servicio Técnico TI' },
            {
              label:
                activeTab === 'ordenes'
                  ? 'Órdenes de Servicio'
                  : activeTab === 'asignaciones'
                  ? 'Asignaciones'
                  : 'Informes Técnicos',
            },
          ]}
        />

        <div className="flex items-center gap-2">
          {activeTab === 'informes' ? (
            <Button
              id="btn-new-informe"
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setInformeDefaultOrden(null);
                setIsCreateInformeOpen(true);
              }}
            >
              Nuevo Informe
            </Button>
          ) : (
            <Button
              id="btn-new-orden"
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOrdenOpen(true)}
            >
              Nueva Orden
            </Button>
          )}
        </div>
      </div>

      {/* Métricas del módulo con gráficos visuales adaptativos */}
      <OrdenesMetrics />

      {/* Navegación por pestañas dentro del panel unificado */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Pestaña 1: Órdenes de Servicio */}
      {activeTab === 'ordenes' && (
        <div className="space-y-3">
          <OrdenesFilters
            search={search}
            onSearchChange={setSearch}
            estadoFilter={estadoFilter}
            onEstadoChange={setEstadoFilter}
            tipoFilter={tipoFilter}
            onTipoChange={setTipoFilter}
            prioridadFilter={prioridadFilter}
            onPrioridadChange={setPrioridadFilter}
            onReset={handleResetFilters}
          />

          <OrdenesTable
            search={search}
            estadoFilter={estadoFilter}
            tipoFilter={tipoFilter}
            prioridadFilter={prioridadFilter}
            onEdit={(ord) => setEditingOrden(ord)}
            onViewDetail={(ord) => setDetailOrden(ord)}
            onCreateInforme={(ord) => {
              setInformeDefaultOrden(ord);
              setIsCreateInformeOpen(true);
            }}
            onViewInforme={(infId) => setDetailInformeId(infId)}
          />
        </div>
      )}

      {/* Pestaña 2: Asignaciones de Carga Técnica */}
      {activeTab === 'asignaciones' && (
        <AsignacionesTab
          onViewDetail={(ord) => setDetailOrden(ord)}
        />
      )}

      {/* Pestaña 3: Informes Técnicos */}
      {activeTab === 'informes' && (
        <InformesTab
          onViewInforme={(infId) => setDetailInformeId(infId)}
          onCreateNewInforme={() => {
            setInformeDefaultOrden(null);
            setIsCreateInformeOpen(true);
          }}
        />
      )}

      {/* Modales de Órdenes */}
      <OrdenCreateModal
        isOpen={isCreateOrdenOpen}
        onClose={() => setIsCreateOrdenOpen(false)}
      />

      <OrdenEditModal
        isOpen={Boolean(editingOrden)}
        onClose={() => setEditingOrden(null)}
        orden={editingOrden}
      />

      <OrdenDetailModal
        isOpen={Boolean(detailOrden)}
        onClose={() => setDetailOrden(null)}
        orden={detailOrden}
        onCreateInforme={(ord) => {
          setDetailOrden(null);
          setInformeDefaultOrden(ord);
          setIsCreateInformeOpen(true);
        }}
        onViewInforme={(infId) => {
          setDetailOrden(null);
          setDetailInformeId(infId);
        }}
      />

      {/* Modales de Informes */}
      <InformeCreateModal
        isOpen={isCreateInformeOpen}
        onClose={() => {
          setIsCreateInformeOpen(false);
          setInformeDefaultOrden(null);
        }}
        defaultOrden={informeDefaultOrden}
      />

      <InformeDetailModal
        isOpen={Boolean(detailInformeId)}
        onClose={() => setDetailInformeId(null)}
        informeId={detailInformeId}
      />
    </div>
  );
}
