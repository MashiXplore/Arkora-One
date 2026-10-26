// src/frontend/components/modules/informes/InformesTable.tsx
// Tabla de Informes Técnicos con acciones de visualización, impresión y eliminación
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useInformes, useDeleteInforme } from '@/frontend/hooks/useOrdenes';
import { Table, Badge, Button, ConfirmDialog, showToast } from '@/frontend/components/ui';
import {
  FileText,
  Printer,
  Eye,
  Trash2,
  Laptop,
  User,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { InformeWithRelations } from '@/types/orden.types';

export interface InformesTableProps {
  search: string;
  tipoFilter: string;
  agenciaFilter: string;
  onViewDetail: (id: number) => void;
  onPrint: (informe: InformeWithRelations) => void;
}

export function InformesTable({
  search,
  tipoFilter,
  agenciaFilter,
  onViewDetail,
  onPrint,
}: InformesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [itemToDelete, setItemToDelete] = useState<InformeWithRelations | null>(null);

  const { data, isLoading } = useInformes({
    page: 1,
    pageSize: 150,
    search: search || undefined,
    agenciaId: agenciaFilter ? Number(agenciaFilter) : undefined,
  });

  const deleteMutation = useDeleteInforme();

  const rawInformes =
    data && 'data' in data && Array.isArray(data.data)
      ? (data.data as InformeWithRelations[])
      : [];

  // Filtrado local por tipo/clasificación
  const filteredInformes = rawInformes.filter((inf) => {
    if (tipoFilter && !inf.tipo_informe.toLowerCase().includes(tipoFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalRecords = filteredInformes.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedInformes = filteredInformes.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await deleteMutation.mutateAsync(itemToDelete.id);
      if (res.success) {
        showToast.success('Informe técnico eliminado correctamente');
      } else {
        showToast.error(res.error?.message ?? 'Error al eliminar informe');
      }
    } catch {
      showToast.error('Error al procesar la solicitud');
    } finally {
      setItemToDelete(null);
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

  const getTipoBadge = (tipo: string) => {
    const lower = tipo.toLowerCase();
    if (lower.includes('grave') || lower.includes('falla')) {
      return <Badge variant="danger">{tipo}</Badge>;
    }
    if (lower.includes('pieza') || lower.includes('reemplazo')) {
      return <Badge variant="warning">{tipo}</Badge>;
    }
    if (lower.includes('baja') || lower.includes('obsolescencia')) {
      return <Badge variant="neutral">{tipo}</Badge>;
    }
    return <Badge variant="info">{tipo}</Badge>;
  };

  const columns = [
    {
      id: 'informe_id',
      header: 'N° Informe / Título',
      cell: (row: InformeWithRelations) => (
        <div className="flex flex-col min-w-0">
          <button
            onClick={() => onViewDetail(row.id)}
            className="text-left font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>INF-{String(row.id).padStart(5, '0')}</span>
          </button>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={row.titulo}>
            {row.titulo}
          </span>
        </div>
      ),
    },
    {
      id: 'orden_ref',
      header: 'Orden Ref.',
      cell: (row: InformeWithRelations) => (
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          <Wrench className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{row.orden.numero_orden}</span>
        </div>
      ),
    },
    {
      id: 'equipo',
      header: 'Activo Evaluado',
      cell: (row: InformeWithRelations) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
            <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{row.orden.equipo.numero_etiqueta}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
            {row.orden.equipo.marca?.nombre} {row.orden.equipo.modelo?.nombre}
          </span>
        </div>
      ),
    },
    {
      id: 'solicitante',
      header: 'Solicitante / Agencia',
      cell: (row: InformeWithRelations) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 text-xs font-medium text-slate-800 dark:text-slate-200">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.orden.funcionario.nombre}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate">
            {row.agencia?.nombre || row.orden.funcionario.departamento_area || 'Sede Central'}
          </span>
        </div>
      ),
    },
    {
      id: 'tecnico',
      header: 'Técnico Evaluador',
      cell: (row: InformeWithRelations) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
            {row.tecnico.name.charAt(0)}
          </div>
          <span className="truncate max-w-[120px]">{row.tecnico.name}</span>
        </div>
      ),
    },
    {
      id: 'tipo',
      header: 'Clasificación',
      cell: (row: InformeWithRelations) => getTipoBadge(row.tipo_informe),
    },
    {
      id: 'fecha',
      header: 'Fecha Emisión',
      cell: (row: InformeWithRelations) => (
        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{formatDate(row.fecha)}</span>
        </div>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (row: InformeWithRelations) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(row.id)}
            title="Ver detalle del informe"
            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPrint(row)}
            title="Imprimir informe oficial"
            className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600"
          >
            <Printer className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItemToDelete(row)}
            title="Eliminar informe"
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
        data={paginatedInformes}
        isLoading={isLoading}
        emptyMessage="No se encontraron informes técnicos con los filtros seleccionados"
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Mostrando {paginatedInformes.length} de {totalRecords} informes
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

      {/* Diálogo de Eliminación */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="¿Eliminar Informe Técnico?"
        message={`¿Estás seguro de eliminar el informe ${itemToDelete?.titulo}? Esta acción es irreversible.`}
        confirmText="Eliminar Informe"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
