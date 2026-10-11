// src/frontend/components/modules/ordenes/InformesTab.tsx
// Pestaña de listado y consulta de Informes Técnicos emitidos
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useInformes, useDeleteInforme } from '@/frontend/hooks/useOrdenes';
import { Table, Button, Input, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Search, Eye, Trash2, FileText, Laptop, User, Calendar, Plus } from 'lucide-react';
import type { InformeWithRelations } from '@/types/orden.types';

export interface InformesTabProps {
  onViewInforme: (id: number) => void;
  onCreateNewInforme: () => void;
}

export function InformesTab({ onViewInforme, onCreateNewInforme }: InformesTabProps) {
  const [search, setSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState<InformeWithRelations | null>(null);

  const { data, isLoading } = useInformes({
    pageSize: 50,
    search: search || undefined,
  });

  const deleteMutation = useDeleteInforme();

  const informes =
    data && 'data' in data && Array.isArray(data.data)
      ? (data.data as InformeWithRelations[])
      : [];

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

  const columns = [
    {
      id: 'titulo',
      header: 'Título del Informe',
      cell: (row: InformeWithRelations) => (
        <div className="flex flex-col">
          <button
            onClick={() => onViewInforme(row.id)}
            className="text-left font-semibold text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[220px]">{row.titulo}</span>
          </button>
          <span className="text-[11px] text-slate-400">{row.tipo_informe}</span>
        </div>
      ),
    },
    {
      id: 'orden',
      header: 'Orden Ref.',
      cell: (row: InformeWithRelations) => (
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
          {row.orden.numero_orden}
        </span>
      ),
    },
    {
      id: 'equipo',
      header: 'Equipo Intervenido',
      cell: (row: InformeWithRelations) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
          <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>{row.orden.equipo.numero_etiqueta}</span>
        </div>
      ),
    },
    {
      id: 'funcionario',
      header: 'Solicitante',
      cell: (row: InformeWithRelations) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.orden.funcionario.nombre}
        </span>
      ),
    },
    {
      id: 'tecnico',
      header: 'Técnico Emisor',
      cell: (row: InformeWithRelations) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
            {row.tecnico.name.charAt(0)}
          </div>
          <span>{row.tecnico.name}</span>
        </div>
      ),
    },
    {
      id: 'fecha',
      header: 'Fecha Emisión',
      cell: (row: InformeWithRelations) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(row.fecha)}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (row: InformeWithRelations) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewInforme(row.id)}
            title="Ver / Imprimir informe"
            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600"
          >
            <Eye className="w-3.5 h-3.5" />
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
      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-96">
          <Input
            id="search-informes"
            placeholder="Buscar por título, orden, técnico o equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onCreateNewInforme}
        >
          Nuevo Informe Técnico
        </Button>
      </div>

      {/* Tabla de Informes */}
      <Table
        columns={columns}
        data={informes}
        isLoading={isLoading}
        emptyMessage="No se han registrado informes técnicos aún"
      />

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="¿Eliminar Informe Técnico?"
        message={`¿Estás seguro de eliminar el informe "${itemToDelete?.titulo}"?`}
        confirmText="Eliminar Informe"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
