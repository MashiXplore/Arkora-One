// src/frontend/components/modules/informes/InformesPage.tsx
// Módulo independiente de Informes Técnicos y Dictámenes Oficiales
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Breadcrumbs, Button } from '@/frontend/components/ui';
import { InformesMetrics } from './InformesMetrics';
import { InformesFilters } from './InformesFilters';
import { InformesTable } from './InformesTable';
import { InformeCreateModal } from './InformeCreateModal';
import { InformeDetailModal } from './InformeDetailModal';
import { InformePrintModal } from './InformePrintModal';
import { Plus } from 'lucide-react';
import type { InformeWithRelations } from '@/types/orden.types';

export function InformesPage() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [agenciaFilter, setAgenciaFilter] = useState('');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailInformeId, setDetailInformeId] = useState<number | null>(null);
  const [printInforme, setPrintInforme] = useState<InformeWithRelations | null>(null);

  const handleResetFilters = () => {
    setSearch('');
    setTipoFilter('');
    setAgenciaFilter('');
  };

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Botón de Acción Principal */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Servicio Técnico TI' },
            { label: 'Informes Técnicos' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            id="btn-new-informe"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Nuevo Informe
          </Button>
        </div>
      </div>

      {/* Métricas con gráficos adaptativos */}
      <InformesMetrics />

      {/* Barra de Filtros */}
      <InformesFilters
        search={search}
        onSearchChange={setSearch}
        tipoFilter={tipoFilter}
        onTipoChange={setTipoFilter}
        agenciaFilter={agenciaFilter}
        onAgenciaChange={setAgenciaFilter}
        onReset={handleResetFilters}
      />

      {/* Tabla de Informes */}
      <InformesTable
        search={search}
        tipoFilter={tipoFilter}
        agenciaFilter={agenciaFilter}
        onViewDetail={(id) => setDetailInformeId(id)}
        onPrint={(inf) => setPrintInforme(inf)}
      />

      {/* Modal Crear Informe */}
      <InformeCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal Detalle */}
      <InformeDetailModal
        isOpen={Boolean(detailInformeId)}
        onClose={() => setDetailInformeId(null)}
        informeId={detailInformeId}
        onPrint={(inf) => {
          setDetailInformeId(null);
          setPrintInforme(inf);
        }}
      />

      {/* Modal Impresión Oficial */}
      <InformePrintModal
        isOpen={Boolean(printInforme)}
        onClose={() => setPrintInforme(null)}
        informe={printInforme}
      />
    </div>
  );
}
