// src/frontend/components/modules/funcionarios/FuncionariosTable.tsx
// Tabla de funcionarios con paginación, estado interactivo y acciones CRUD
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useFuncionarios, useDeleteFuncionario } from '@/frontend/hooks/useFuncionarios';
import { Table, Badge, Button, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Mail, Phone, Building2 } from 'lucide-react';
import type { FuncionarioWithRelations } from '@/types/funcionario.types';

export interface FuncionariosTableProps {
  search: string;
  sucursalFilter: string;
  agenciaFilter: string;
  cargoFilter: string;
  estadoFilter: string;
  onEdit: (funcionario: FuncionarioWithRelations) => void;
}

export function FuncionariosTable({
  search,
  sucursalFilter,
  agenciaFilter,
  cargoFilter,
  estadoFilter,
  onEdit,
}: FuncionariosTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [itemToDelete, setItemToDelete] = useState<FuncionarioWithRelations | null>(null);

  const { data, isLoading } = useFuncionarios({
    page,
    pageSize,
    search: search || undefined,
    sucursalId: sucursalFilter ? Number(sucursalFilter) : undefined,
    agenciaId: agenciaFilter ? Number(agenciaFilter) : undefined,
    cargoId: cargoFilter ? Number(cargoFilter) : undefined,
    estado: estadoFilter !== '' ? estadoFilter === 'true' : undefined,
  });

  const deleteMutation = useDeleteFuncionario();

  const funcionarios =
    data && 'data' in data && Array.isArray(data.data)
      ? (data.data as FuncionarioWithRelations[])
      : [];

  const pagination = data && 'pagination' in data ? data.pagination : null;

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(itemToDelete.id);
      if (result.success) {
        showToast.success('Funcionario eliminado correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión al eliminar');
    } finally {
      setItemToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Funcionario',
      accessorKey: 'nombre' as keyof FuncionarioWithRelations,
      cell: (row: FuncionarioWithRelations) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
            {row.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</div>
            <div className="text-xs text-slate-400">{row.departamento_area || 'Sin departamento'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Cargo / Puesto',
      accessorKey: 'cargo' as keyof FuncionarioWithRelations,
      cell: (row: FuncionarioWithRelations) => (
        <span className="inline-flex items-center text-xs font-medium text-slate-800 dark:text-slate-200">
          {row.cargo?.nombre ?? 'Sin cargo'}
        </span>
      ),
    },
    {
      header: 'Agencia y Sucursal',
      accessorKey: 'agencia' as keyof FuncionarioWithRelations,
      cell: (row: FuncionarioWithRelations) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{row.agencia?.nombre ?? 'Sin agencia'}</span>
          </div>
          <div className="text-slate-400 pl-4.5">
            {row.agencia?.sucursal?.nombre ?? 'Sucursal no asignada'}
          </div>
        </div>
      ),
    },
    {
      header: 'Contacto',
      accessorKey: 'correo' as keyof FuncionarioWithRelations,
      cell: (row: FuncionarioWithRelations) => (
        <div className="space-y-0.5 text-xs">
          {row.correo ? (
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{row.correo}</span>
            </div>
          ) : null}
          {row.telefono ? (
            <div className="flex items-center gap-1 text-slate-500">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{row.telefono}</span>
            </div>
          ) : null}
          {!row.correo && !row.telefono && (
            <span className="text-slate-400">Sin datos de contacto</span>
          )}
        </div>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado' as keyof FuncionarioWithRelations,
      cell: (row: FuncionarioWithRelations) => (
        <Badge variant={row.estado ? 'success' : 'danger'}>
          {row.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof FuncionarioWithRelations,
      cell: (row: FuncionarioWithRelations) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            title="Editar funcionario"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItemToDelete(row)}
            title="Eliminar funcionario"
          >
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
          data={funcionarios}
          isLoading={isLoading}
          emptyMessage="No se encontraron funcionarios con los filtros seleccionados"
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
        title="Eliminar Funcionario"
        message={`¿Estás seguro de que deseas eliminar al funcionario "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
}
