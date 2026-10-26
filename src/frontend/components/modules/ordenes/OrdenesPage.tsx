// src/frontend/components/modules/ordenes/OrdenesPage.tsx
// Vista contenedora principal del módulo dedicado de Órdenes de Servicio Técnico
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Breadcrumbs, Button } from '@/frontend/components/ui';
import { OrdenesMetrics } from './OrdenesMetrics';
import { OrdenesFilters } from './OrdenesFilters';
import { OrdenesTable } from './OrdenesTable';
import { OrdenCreateModal } from './OrdenCreateModal';
import { OrdenEditModal } from './OrdenEditModal';
import { OrdenDetailModal } from './OrdenDetailModal';
import { OrdenPrintModal } from './OrdenPrintModal';
import { InformeCreateModal } from '@/frontend/components/modules/informes/InformeCreateModal';
import { InformeDetailModal } from '@/frontend/components/modules/informes/InformeDetailModal';
import { InformePrintModal } from '@/frontend/components/modules/informes/InformePrintModal';
import { Plus, Wrench } from 'lucide-react';
import type { OrdenWithRelations, InformeWithRelations } from '@/types/orden.types';

export function OrdenesPage() {
  // Modales de Órdenes
  const [isCreateOrdenOpen, setIsCreateOrdenOpen] = useState(false);
  const [editingOrden, setEditingOrden] = useState<OrdenWithRelations | null>(null);
  const [detailOrden, setDetailOrden] = useState<OrdenWithRelations | null>(null);
  const [printOrden, setPrintOrden] = useState<OrdenWithRelations | null>(null);

  // Modales de Informes (cuando se convierte una orden o se consulta su informe)
  const [isCreateInformeOpen, setIsCreateInformeOpen] = useState(false);
  const [informeDefaultOrden, setInformeDefaultOrden] = useState<OrdenWithRelations | null>(null);
  const [detailInformeId, setDetailInformeId] = useState<number | null>(null);
  const [printInforme, setPrintInforme] = useState<InformeWithRelations | null>(null);

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

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Botón de Acción Principal */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Servicio Técnico TI' },
            { label: 'Órdenes de Servicio' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            id="btn-new-orden"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOrdenOpen(true)}
          >
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Métricas con gráficos visuales adaptativos */}
      <OrdenesMetrics />

      {/* Filtros de búsqueda */}
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

      {/* Tabla de Órdenes */}
      <OrdenesTable
        search={search}
        estadoFilter={estadoFilter}
        tipoFilter={tipoFilter}
        prioridadFilter={prioridadFilter}
        onEdit={(ord) => setEditingOrden(ord)}
        onViewDetail={(ord) => setDetailOrden(ord)}
        onPrint={(ord) => setPrintOrden(ord)}
        onCreateInforme={(ord) => {
          setInformeDefaultOrden(ord);
          setIsCreateInformeOpen(true);
        }}
        onViewInforme={(infId) => setDetailInformeId(infId)}
      />

      {/* Modales de Gestión de Órdenes */}
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
        onPrint={(ord) => setPrintOrden(ord)}
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

      {/* Modal Impresión de Ficha de Servicio */}
      <OrdenPrintModal
        isOpen={Boolean(printOrden)}
        onClose={() => setPrintOrden(null)}
        orden={printOrden}
      />

      {/* Modales para Informes Técnicos vinculados */}
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
        onPrint={(inf) => {
          setDetailInformeId(null);
          setPrintInforme(inf);
        }}
      />

      <InformePrintModal
        isOpen={Boolean(printInforme)}
        onClose={() => setPrintInforme(null)}
        informe={printInforme}
      />
    </div>
  );
}
