// src/frontend/components/modules/ordenes/OrdenesTable.tsx
// Tabla de órdenes de servicio con paginación, filtros y acciones
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useOrdenes, useDeleteOrden } from '@/frontend/hooks/useOrdenes';
import { Table, Badge, Button, ConfirmDialog, showToast } from '@/frontend/components/ui';
import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePlus,
  FileCheck2,
  Clock,
  Laptop,
  User,
  Shield,
} from 'lucide-react';
import type {
  OrdenWithRelations,
  EstadoOrden,
  TipoServicio,
  Prioridad,
} from '@/types/orden.types';

export interface OrdenesTableProps {
  search: string;
  estadoFilter: string;
  tipoFilter: string;
  prioridadFilter: string;
  idTecnicoFilter?: number;
  onEdit: (orden: OrdenWithRelations) => void;
  onViewDetail: (orden: OrdenWithRelations) => void;
  onCreateInforme: (orden: OrdenWithRelations) => void;
  onViewInforme: (informeId: number) => void;
}

export function OrdenesTable({
  search,
  estadoFilter,
  tipoFilter,
  prioridadFilter,
  idTecnicoFilter,
  onEdit,
  onViewDetail,
  onCreateInforme,
  onViewInforme,
}: OrdenesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [itemToDelete, setItemToDelete] = useState<OrdenWithRelations | null>(null);

  const { data, isLoading } = useOrdenes({
    page,
    pageSize,
    search: search || undefined,
    estado: (estadoFilter as EstadoOrden) || undefined,
    tipo_servicio: (tipoFilter as TipoServicio) || undefined,
    prioridad: (prioridadFilter as Prioridad) || undefined,
    id_tecnico: idTecnicoFilter || undefined,
  });

  const deleteMutation = useDeleteOrden();

  const ordenes =
    data && 'data' in data && Array.isArray(data.data) ? (data.data as OrdenWithRelations[]) : [];
  const pagination = data && 'pagination' in data ? data.pagination : null;

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(itemToDelete.id);
      if (result.success) {
        showToast.success('Orden de servicio eliminada correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error al procesar la solicitud');
    } finally {
      setItemToDelete(null);
    }
  };

  const getEstadoBadge = (estado: EstadoOrden) => {
    switch (estado) {
      case 'creado':
        return <Badge variant="info">Creado</Badge>;
      case 'en_proceso':
        return <Badge variant="warning">En Proceso</Badge>;
      case 'finalizado':
        return <Badge variant="success">Finalizado</Badge>;
      case 'entregado':
        return <Badge variant="success">Entregado</Badge>;
      case 'cancelado':
        return <Badge variant="danger">Cancelado</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  const getPrioridadBadge = (prio: Prioridad) => {
    switch (prio) {
      case 'urgente':
        return <Badge variant="danger">Urgente</Badge>;
      case 'alta':
        return <Badge variant="warning">Alta</Badge>;
      case 'media':
        return <Badge variant="info">Media</Badge>;
      case 'baja':
        return <Badge variant="neutral">Baja</Badge>;
    }
  };

  const formatServicio = (tipo: TipoServicio) => {
    switch (tipo) {
      case 'mantenimiento_preventivo':
        return 'Mant. Preventivo';
      case 'mantenimiento_correctivo':
        return 'Mant. Correctivo';
      case 'reparacion':
        return 'Reparación';
      case 'diagnostico':
        return 'Diagnóstico';
      case 'instalacion':
        return 'Instalación';
    }
  };

  const formatDate = (dateVal: string | Date | null) => {
    if (!dateVal) return '-';
    return new Date(dateVal).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns = [
    {
      id: 'numero_orden',
      header: 'N° Orden',
      cell: (row: OrdenWithRelations) => (
        <button
          onClick={() => onViewDetail(row)}
          className="text-left font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
          title="Ver detalle completo"
        >
          {row.numero_orden}
        </button>
      ),
    },
    {
      id: 'fecha',
      header: 'Fecha',
      cell: (row: OrdenWithRelations) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(row.fecha)}
        </span>
      ),
    },
    {
      id: 'equipo',
      header: 'Equipo TI',
      cell: (row: OrdenWithRelations) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
            <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{row.equipo.numero_etiqueta}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate">
            {row.equipo.tipo_equipo?.nombre} · {row.equipo.marca?.nombre} {row.equipo.modelo?.nombre}
          </span>
        </div>
      ),
    },
    {
      id: 'funcionario',
      header: 'Solicitante / Área',
      cell: (row: OrdenWithRelations) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.funcionario?.nombre}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate">
            {row.funcionario?.departamento_area || 'Área general'} · {row.funcionario?.agencia?.nombre || 'Agencia'}
          </span>
        </div>
      ),
    },
    {
      id: 'tecnico',
      header: 'Técnico Asignado',
      cell: (row: OrdenWithRelations) => (
        row.tecnico ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
              {row.tecnico.name.charAt(0)}
            </div>
            <span className="truncate max-w-[120px]">{row.tecnico.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Sin asignar</span>
        )
      ),
    },
    {
      id: 'tipo_servicio',
      header: 'Servicio',
      cell: (row: OrdenWithRelations) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {formatServicio(row.tipo_servicio)}
        </span>
      ),
    },
    {
      id: 'prioridad',
      header: 'Prioridad',
      cell: (row: OrdenWithRelations) => getPrioridadBadge(row.prioridad),
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: (row: OrdenWithRelations) => getEstadoBadge(row.estado),
    },
    {
      id: 'informe',
      header: 'Informe Técnico',
      cell: (row: OrdenWithRelations) => (
        row.informe ? (
          <button
            onClick={() => onViewInforme(row.informe!.id)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            title="Ver informe técnico"
          >
            <FileCheck2 className="w-3 h-3" />
            <span>Emitido</span>
          </button>
        ) : (
          <button
            onClick={() => onCreateInforme(row)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors"
            title="Generar informe para esta orden"
          >
            <FilePlus className="w-3 h-3" />
            <span>Pendiente</span>
          </button>
        )
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (row: OrdenWithRelations) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(row)}
            title="Ver detalles"
            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            title="Editar orden"
            className="h-7 w-7 p-0 text-slate-500 hover:text-amber-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItemToDelete(row)}
            title="Eliminar orden"
            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Table
        columns={columns}
        data={ordenes}
        isLoading={isLoading}
        emptyMessage="No se encontraron órdenes de servicio con los filtros aplicados"
      />

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Mostrando {ordenes.length} de {pagination.totalRecords} órdenes
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 font-medium">
              {page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="h-7 px-2"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmación para Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="¿Eliminar Orden de Servicio?"
        message={`¿Estás seguro de eliminar la orden ${itemToDelete?.numero_orden}? Si posee un informe técnico asociado, también se eliminará.`}
        confirmText="Eliminar Orden"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
