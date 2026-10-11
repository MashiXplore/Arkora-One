// src/frontend/components/modules/equipos/EquiposTable.tsx
// Tabla de equipos con ordenamiento, búsqueda, paginación y estado operativo
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useEquipos, useDeleteEquipo } from '@/frontend/hooks/useEquipos';
import { Table, Badge, Button, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Laptop, User, Tag, Calendar } from 'lucide-react';
import type { EquipoWithRelations, EstadoOperativoType } from '@/types/equipo.types';

export interface EquiposTableProps {
  search: string;
  marcaFilter: string;
  tipoFilter: string;
  modeloFilter: string;
  estadoFilter: string;
  onEdit: (equipo: EquipoWithRelations) => void;
}

export function EquiposTable({
  search,
  marcaFilter,
  tipoFilter,
  modeloFilter,
  estadoFilter,
  onEdit,
}: EquiposTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [itemToDelete, setItemToDelete] = useState<EquipoWithRelations | null>(null);

  const { data, isLoading } = useEquipos({
    page,
    pageSize,
    search: search || undefined,
    marcaId: marcaFilter ? Number(marcaFilter) : undefined,
    tipoEquipoId: tipoFilter ? Number(tipoFilter) : undefined,
    modeloId: modeloFilter ? Number(modeloFilter) : undefined,
    estadoOperativo: (estadoFilter as EstadoOperativoType) || undefined,
  });

  const deleteMutation = useDeleteEquipo();

  const equipos =
    data && 'data' in data && Array.isArray(data.data) ? (data.data as EquipoWithRelations[]) : [];

  const pagination = data && 'pagination' in data ? data.pagination : null;

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(itemToDelete.id);
      if (result.success) {
        showToast.success('Equipo eliminado correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión');
    } finally {
      setItemToDelete(null);
    }
  };

  const getStatusBadgeVariant = (status: EstadoOperativoType): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'operativo':
        return 'success';
      case 'en_mantenimiento':
        return 'warning';
      case 'de_baja':
        return 'danger';
      case 'en_desuso':
        return 'info';
      default:
        return 'info';
    }
  };

  const formatStatusLabel = (status: EstadoOperativoType) => {
    switch (status) {
      case 'operativo':
        return 'Operativo';
      case 'en_mantenimiento':
        return 'Mantenimiento';
      case 'de_baja':
        return 'De Baja';
      case 'en_desuso':
        return 'En Desuso';
      default:
        return status;
    }
  };

  const columns = [
    {
      header: 'Código / Etiqueta',
      accessorKey: 'numero_etiqueta' as keyof EquipoWithRelations,
      cell: (row: EquipoWithRelations) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">{row.numero_etiqueta}</span>
            {row.numero_serie && (
              <div className="text-[11px] text-slate-400">S/N: {row.numero_serie}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Hardware (Marca y Modelo)',
      accessorKey: 'modelo' as keyof EquipoWithRelations,
      cell: (row: EquipoWithRelations) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{row.marca?.nombre} {row.modelo?.nombre}</span>
          </div>
          <div className="text-slate-400 pl-5">
            {row.tipo_equipo?.nombre}
          </div>
        </div>
      ),
    },
    {
      header: 'Custodio / Funcionario',
      accessorKey: 'funcionario' as keyof EquipoWithRelations,
      cell: (row: EquipoWithRelations) => (
        <div className="text-xs">
          {row.funcionario ? (
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{row.funcionario.nombre}</span>
              </div>
              <div className="text-slate-400 pl-5">
                {row.funcionario.agencia?.nombre || 'Sin agencia'}
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Disponible (En Almacén)
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Fecha Ingreso',
      accessorKey: 'fecha_ingreso' as keyof EquipoWithRelations,
      cell: (row: EquipoWithRelations) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {row.fecha_ingreso
              ? new Date(row.fecha_ingreso).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'No registrada'}
          </span>
        </div>
      ),
    },
    {
      header: 'Estado Operativo',
      accessorKey: 'estado_operativo' as keyof EquipoWithRelations,
      cell: (row: EquipoWithRelations) => (
        <Badge variant={getStatusBadgeVariant(row.estado_operativo)}>
          {formatStatusLabel(row.estado_operativo)}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof EquipoWithRelations,
      cell: (row: EquipoWithRelations) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row)} title="Editar equipo">
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setItemToDelete(row)} title="Eliminar equipo">
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={equipos}
          isLoading={isLoading}
          emptyMessage="No se encontraron equipos con los filtros seleccionados"
        />

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Página {pagination.page} de {pagination.totalPages} ({pagination.totalRecords} total)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Eliminar Equipo"
        message={`¿Estás seguro de que deseas eliminar el equipo "${itemToDelete?.numero_etiqueta}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
}
