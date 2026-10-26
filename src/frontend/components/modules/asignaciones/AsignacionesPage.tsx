// src/frontend/components/modules/asignaciones/AsignacionesPage.tsx
// Módulo independiente de Custodia, Asignaciones y Trazabilidad de Equipos TI
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Breadcrumbs, Button } from '@/frontend/components/ui';
import { AsignacionesMetrics } from './AsignacionesMetrics';
import { AsignacionesFilters } from './AsignacionesFilters';
import { AsignacionesTable } from './AsignacionesTable';
import { AsignacionModal } from './AsignacionModal';
import { AsignacionHistoryModal } from './AsignacionHistoryModal';
import { AsignacionPrintModal } from './AsignacionPrintModal';
import { Plus, ClipboardCheck, ArrowRightLeft } from 'lucide-react';
import type { EquipoWithRelations } from '@/types/equipo.types';

export function AsignacionesPage() {
  const [search, setSearch] = useState('');
  const [custodiaFilter, setCustodiaFilter] = useState('');
  const [agenciaFilter, setAgenciaFilter] = useState('');
  const [tipoEquipoFilter, setTipoEquipoFilter] = useState('');

  // Modales
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEquipoForAssign, setSelectedEquipoForAssign] = useState<EquipoWithRelations | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEquipoForHistory, setSelectedEquipoForHistory] = useState<EquipoWithRelations | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedEquipoForPrint, setSelectedEquipoForPrint] = useState<EquipoWithRelations | null>(null);

  const handleResetFilters = () => {
    setSearch('');
    setCustodiaFilter('');
    setAgenciaFilter('');
    setTipoEquipoFilter('');
  };

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Botón de Acción Principal */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Control de Activos TI' },
            { label: 'Asignaciones y Custodia' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            id="btn-new-asignacion"
            variant="primary"
            size="sm"
            leftIcon={<ArrowRightLeft className="w-4 h-4" />}
            onClick={() => {
              setSelectedEquipoForAssign(null);
              setIsAssignModalOpen(true);
            }}
          >
            Nueva Asignación / Mover
          </Button>
        </div>
      </div>

      {/* Métricas con diseño adaptativo y gráficos de progreso */}
      <AsignacionesMetrics />

      {/* Barra de Filtros */}
      <AsignacionesFilters
        search={search}
        onSearchChange={setSearch}
        custodiaFilter={custodiaFilter}
        onCustodiaChange={setCustodiaFilter}
        agenciaFilter={agenciaFilter}
        onAgenciaChange={setAgenciaFilter}
        tipoEquipoFilter={tipoEquipoFilter}
        onTipoEquipoChange={setTipoEquipoFilter}
        onReset={handleResetFilters}
      />

      {/* Tabla de Activos y Asignaciones */}
      <AsignacionesTable
        search={search}
        custodiaFilter={custodiaFilter}
        agenciaFilter={agenciaFilter}
        tipoEquipoFilter={tipoEquipoFilter}
        onAssignOrReassign={(equipo) => {
          setSelectedEquipoForAssign(equipo);
          setIsAssignModalOpen(true);
        }}
        onViewHistory={(equipo) => {
          setSelectedEquipoForHistory(equipo);
          setIsHistoryModalOpen(true);
        }}
        onPrintActa={(equipo) => {
          setSelectedEquipoForPrint(equipo);
          setIsPrintModalOpen(true);
        }}
      />

      {/* Modal para Asignar / Reasignar / Devolver */}
      <AsignacionModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedEquipoForAssign(null);
        }}
        defaultEquipo={selectedEquipoForAssign}
      />

      {/* Modal de Historial y Trazabilidad */}
      <AsignacionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedEquipoForHistory(null);
        }}
        equipo={selectedEquipoForHistory}
      />

      {/* Modal de Impresión de Acta de Entrega */}
      <AsignacionPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedEquipoForPrint(null);
        }}
        equipo={selectedEquipoForPrint}
      />
    </div>
  );
}
