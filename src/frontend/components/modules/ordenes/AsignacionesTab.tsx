// src/frontend/components/modules/ordenes/AsignacionesTab.tsx
// Pestaña de Gestión de Asignaciones y Carga Técnica de Órdenes
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useOrdenes, useOrdenMetrics, useUpdateOrden } from '@/frontend/hooks/useOrdenes';
import { useUsers } from '@/frontend/hooks/useUsers';
import { Table, Badge, Button, Select, Modal, showToast } from '@/frontend/components/ui';
import {
  UserCheck,
  Clock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRightLeft,
  User,
} from 'lucide-react';
import type { OrdenWithRelations, EstadoOrden } from '@/types/orden.types';
import type { User as UserType } from '@/types/user.types';

export interface AsignacionesTabProps {
  onViewDetail: (orden: OrdenWithRelations) => void;
}

export function AsignacionesTab({ onViewDetail }: AsignacionesTabProps) {
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [reassigningOrden, setReassigningOrden] = useState<OrdenWithRelations | null>(null);
  const [newTecnicoId, setNewTecnicoId] = useState<string>('');

  const { data: metricsData } = useOrdenMetrics();
  const { data: usersData } = useUsers({ pageSize: 100 });
  const { data: ordenesData, isLoading } = useOrdenes({
    pageSize: 50,
    id_tecnico: selectedTecnico ? Number(selectedTecnico) : undefined,
  });

  const updateMutation = useUpdateOrden();

  const metrics =
    metricsData && 'data' in metricsData && metricsData.data ? metricsData.data : null;

  const users =
    usersData && 'data' in usersData && Array.isArray(usersData.data)
      ? (usersData.data as UserType[])
      : [];

  const ordenes =
    ordenesData && 'data' in ordenesData && Array.isArray(ordenesData.data)
      ? (ordenesData.data as OrdenWithRelations[])
      : [];

  const handleReassign = async () => {
    if (!reassigningOrden) return;
    try {
      const res = await updateMutation.mutateAsync({
        id: reassigningOrden.id,
        data: {
          id_tecnico: newTecnicoId ? Number(newTecnicoId) : null,
          estado: reassigningOrden.estado === 'creado' && newTecnicoId ? 'en_proceso' : reassigningOrden.estado,
        },
      });

      if (res.success) {
        showToast.success('Técnico asignado correctamente');
        setReassigningOrden(null);
        setNewTecnicoId('');
      } else {
        showToast.error(res.error?.message ?? 'Error al reasignar');
      }
    } catch {
      showToast.error('Error al procesar la reasignación');
    }
  };

  const tecnicoFilterOptions = [
    { value: '', label: 'Todos los técnicos' },
    ...users
      .filter((u) => u.isActive)
      .map((u) => ({
        value: u.id,
        label: u.name,
      })),
  ];

  const columns = [
    {
      id: 'numero_orden',
      header: 'N° Orden',
      cell: (row: OrdenWithRelations) => (
        <button
          onClick={() => onViewDetail(row)}
          className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {row.numero_orden}
        </button>
      ),
    },
    {
      id: 'tecnico',
      header: 'Técnico Responsable',
      cell: (row: OrdenWithRelations) => (
        row.tecnico ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-100 font-medium">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {row.tecnico.name.charAt(0)}
            </div>
            <span>{row.tecnico.name}</span>
          </div>
        ) : (
          <Badge variant="warning">Sin Asignar</Badge>
        )
      ),
    },
    {
      id: 'equipo',
      header: 'Equipo',
      cell: (row: OrdenWithRelations) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
            {row.equipo.numero_etiqueta}
          </span>
          <span className="text-[11px] text-slate-400">
            {row.equipo.marca?.nombre} {row.equipo.modelo?.nombre}
          </span>
        </div>
      ),
    },
    {
      id: 'funcionario',
      header: 'Solicitante',
      cell: (row: OrdenWithRelations) => (
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <div className="font-medium">{row.funcionario.nombre}</div>
          <div className="text-[11px] text-slate-400">{row.funcionario.departamento_area || 'Área general'}</div>
        </div>
      ),
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: (row: OrdenWithRelations) => {
        const variants: Record<EstadoOrden, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
          creado: 'info',
          en_proceso: 'warning',
          finalizado: 'success',
          entregado: 'success',
          cancelado: 'danger',
        };
        return <Badge variant={variants[row.estado] || 'neutral'}>{row.estado}</Badge>;
      },
    },
    {
      id: 'acciones',
      header: 'Reasignar',
      cell: (row: OrdenWithRelations) => (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowRightLeft className="w-3 h-3" />}
          onClick={() => {
            setReassigningOrden(row);
            setNewTecnicoId(row.id_tecnico ? String(row.id_tecnico) : '');
          }}
          className="h-7 text-xs"
        >
          {row.tecnico ? 'Cambiar' : 'Asignar'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Resumen de Carga por Técnico */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Tablero de Asignaciones y Carga Técnica
          </span>
        </div>

        <div className="w-full sm:w-64">
          <Select
            id="filtro-tecnico-tablero"
            options={tecnicoFilterOptions}
            value={selectedTecnico}
            onChange={(e) => setSelectedTecnico(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Asignaciones */}
      <Table
        columns={columns}
        data={ordenes}
        isLoading={isLoading}
        emptyMessage="No hay órdenes asignadas con los criterios seleccionados"
      />

      {/* Modal Rápido de Reasignación */}
      <Modal
        isOpen={Boolean(reassigningOrden)}
        onClose={() => setReassigningOrden(null)}
        title="Asignar Técnico Responsable"
        description={`Asignar o reasignar la orden ${reassigningOrden?.numero_orden} (${reassigningOrden?.equipo.numero_etiqueta})`}
        size="md"
      >
        <div className="space-y-4">
          <Select
            id="modal-select-nuevo-tecnico"
            label="Seleccionar Técnico"
            options={[
              { value: '', label: 'Desasignar (Sin técnico)' },
              ...users
                .filter((u) => u.isActive)
                .map((u) => ({
                  value: u.id,
                  label: `${u.name} (${u.role?.name || 'Técnico'})`,
                })),
            ]}
            value={newTecnicoId}
            onChange={(e) => setNewTecnicoId(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setReassigningOrden(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReassign}
              isLoading={updateMutation.isPending}
            >
              Confirmar Asignación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
