// src/frontend/components/modules/asignaciones/AsignacionesTable.tsx
// Tabla de custodia y trazabilidad de asignación de equipos TI
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useEquipos } from '@/frontend/hooks/useEquipos';
import { Table, Badge, Button } from '@/frontend/components/ui';
import {
  Laptop,
  User,
  Building2,
  Calendar,
  History,
  ArrowRightLeft,
  Printer,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  CheckCircle2,
} from 'lucide-react';
import type { EquipoWithRelations } from '@/types/equipo.types';

export interface AsignacionesTableProps {
  search: string;
  custodiaFilter: string;
  agenciaFilter: string;
  tipoEquipoFilter: string;
  onAssignOrReassign: (equipo: EquipoWithRelations) => void;
  onViewHistory: (equipo: EquipoWithRelations) => void;
  onPrintActa: (equipo: EquipoWithRelations) => void;
}

export function AsignacionesTable({
  search,
  custodiaFilter,
  agenciaFilter,
  tipoEquipoFilter,
  onAssignOrReassign,
  onViewHistory,
  onPrintActa,
}: AsignacionesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading } = useEquipos({
    page,
    pageSize: 100, // Client side filtering for rich combinations
    search: search || undefined,
    tipoEquipoId: tipoEquipoFilter ? Number(tipoEquipoFilter) : undefined,
  });

  const rawEquipos =
    data && 'data' in data && Array.isArray(data.data) ? (data.data as EquipoWithRelations[]) : [];

  // Filtrado adicional por custodia y agencia
  const filteredEquipos = rawEquipos.filter((eq) => {
    if (custodiaFilter === 'asignado' && !eq.funcionario_id) return false;
    if (custodiaFilter === 'disponible' && eq.funcionario_id) return false;

    if (agenciaFilter) {
      if (!eq.funcionario?.agenciaId || String(eq.funcionario.agenciaId) !== agenciaFilter) {
        return false;
      }
    }

    return true;
  });

  // Paginación local sobre la lista filtrada
  const totalRecords = filteredEquipos.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedEquipos = filteredEquipos.slice((page - 1) * pageSize, page * pageSize);

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
      id: 'etiqueta',
      header: 'Código Activo',
      cell: (row: EquipoWithRelations) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
            <Laptop className="w-3.5 h-3.5 shrink-0" />
            <span>{row.numero_etiqueta}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {row.tipo_equipo?.nombre || 'Equipo'}
          </span>
        </div>
      ),
    },
    {
      id: 'modelo',
      header: 'Marca y Modelo',
      cell: (row: EquipoWithRelations) => (
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            {row.marca?.nombre} {row.modelo?.nombre}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            S/N: {row.numero_serie || 'No registrado'}
          </span>
        </div>
      ),
    },
    {
      id: 'custodio',
      header: 'Custodio Responsable',
      cell: (row: EquipoWithRelations) =>
        row.funcionario ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
              {row.funcionario.nombre.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                {row.funcionario.nombre}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {row.funcionario.departamento_area || 'Área general'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <PackageOpen className="w-3.5 h-3.5" />
            <span>En Almacén TI / Stock</span>
          </div>
        ),
    },
    {
      id: 'agencia',
      header: 'Agencia / Ubicación',
      cell: (row: EquipoWithRelations) =>
        row.funcionario?.agencia ? (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{row.funcionario.agencia.nombre}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {row.funcionario.agencia.sucursal?.nombre || 'Regional'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Sede Central - TI</span>
        ),
    },
    {
      id: 'estado_custodia',
      header: 'Estado Custodia',
      cell: (row: EquipoWithRelations) =>
        row.funcionario_id ? (
          <Badge variant="success">Asignado</Badge>
        ) : (
          <Badge variant="info">En Almacén</Badge>
        ),
    },
    {
      id: 'fecha',
      header: 'Fecha Reg.',
      cell: (row: EquipoWithRelations) => (
        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{formatDate(row.fecha_ingreso || row.createdAt)}</span>
        </div>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (row: EquipoWithRelations) => (
        <div className="flex items-center justify-end gap-1">
          {/* Asignar o Reasignar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAssignOrReassign(row)}
            title={row.funcionario_id ? 'Reasignar / Devolver custodia' : 'Asignar a funcionario'}
            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
            <span>{row.funcionario_id ? 'Reasignar' : 'Asignar'}</span>
          </Button>

          {/* Historial de Trazabilidad */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewHistory(row)}
            title="Ver trazabilidad y seguimiento histórico"
            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600"
          >
            <History className="w-3.5 h-3.5" />
          </Button>

          {/* Imprimir Acta */}
          {row.funcionario_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPrintActa(row)}
              title="Imprimir Acta de Asignación y Entrega"
              className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600"
            >
              <Printer className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Table
        columns={columns}
        data={paginatedEquipos}
        isLoading={isLoading}
        emptyMessage="No se encontraron registros de asignación con los filtros aplicados"
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Mostrando {paginatedEquipos.length} de {totalRecords} activos
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
              {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
