// src/frontend/components/modules/equipos/TiposEquipoTab.tsx
// Panel integrado para la gestión de Tipos de Equipo dentro del módulo de Equipos
// Skill: react-modernization

'use client';

import { useState } from 'react';
import {
  useTiposEquipo,
  useMarcas,
  useCreateTipoEquipo,
  useUpdateTipoEquipo,
  useDeleteTipoEquipo,
} from '@/frontend/hooks/useEquipos';
import { Table, Badge, Button, Modal, Input, Select, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Plus, Edit2, Trash2, Cpu, Layers, Laptop } from 'lucide-react';
import type { TipoEquipo } from '@/types/equipo.types';

export function TiposEquipoTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoEquipo | null>(null);
  const [tipoToDelete, setTipoToDelete] = useState<TipoEquipo | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [marcaId, setMarcaId] = useState<string>('');
  const [estado, setEstado] = useState(true);

  const { data: tiposData, isLoading } = useTiposEquipo();
  const { data: marcasData } = useMarcas();

  const createMutation = useCreateTipoEquipo();
  const updateMutation = useUpdateTipoEquipo();
  const deleteMutation = useDeleteTipoEquipo();

  const tipos =
    tiposData && 'success' in tiposData && tiposData.success && Array.isArray(tiposData.data)
      ? tiposData.data
      : [];

  const marcas =
    marcasData && 'success' in marcasData && marcasData.success && Array.isArray(marcasData.data)
      ? marcasData.data
      : [];

  const handleOpenCreate = () => {
    setEditingTipo(null);
    setNombre('');
    setSlug('');
    setMarcaId('');
    setEstado(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tipo: TipoEquipo) => {
    setEditingTipo(tipo);
    setNombre(tipo.nombre);
    setSlug(tipo.slug);
    setMarcaId(tipo.marcaId ? String(tipo.marcaId) : '');
    setEstado(tipo.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast.error('El nombre del tipo de equipo es obligatorio');
      return;
    }

    try {
      if (editingTipo) {
        const result = await updateMutation.mutateAsync({
          id: editingTipo.id,
          data: {
            nombre,
            slug: slug || undefined,
            marcaId: marcaId ? Number(marcaId) : null,
            estado,
          },
        });
        if (result.success) {
          showToast.success('Tipo de equipo actualizado correctamente');
          setIsModalOpen(false);
        } else {
          showToast.error(result.error?.message ?? 'Error al actualizar');
        }
      } else {
        const result = await createMutation.mutateAsync({
          nombre,
          slug: slug || undefined,
          marcaId: marcaId ? Number(marcaId) : null,
          estado,
        });
        if (result.success) {
          showToast.success('Tipo de equipo creado exitosamente');
          setIsModalOpen(false);
        } else {
          showToast.error(result.error?.message ?? 'Error al crear');
        }
      }
    } catch {
      showToast.error('Error de conexión');
    }
  };

  const handleDelete = async () => {
    if (!tipoToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(tipoToDelete.id);
      if (result.success) {
        showToast.success('Tipo de equipo eliminado correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión');
    } finally {
      setTipoToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Categoría / Tipo de Equipo',
      accessorKey: 'nombre' as keyof TipoEquipo,
      cell: (row: TipoEquipo) => (
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</span>
            <div className="text-[11px] text-slate-400">slug: {row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Marca Principal',
      accessorKey: 'marca' as keyof TipoEquipo,
      cell: (row: TipoEquipo) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.marca?.nombre || 'Multimarca / General'}
        </span>
      ),
    },
    {
      header: 'Modelos en Catálogo',
      accessorKey: 'id' as keyof TipoEquipo,
      cell: (row: TipoEquipo) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <Layers className="w-3 h-3" />
          {row._count?.modelos ?? 0} modelos
        </span>
      ),
    },
    {
      header: 'Equipos Físicos',
      accessorKey: 'id' as keyof TipoEquipo,
      cell: (row: TipoEquipo) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Laptop className="w-3 h-3" />
          {row._count?.equipos ?? 0} activos
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado' as keyof TipoEquipo,
      cell: (row: TipoEquipo) => (
        <Badge variant={row.estado ? 'success' : 'danger'}>
          {row.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof TipoEquipo,
      cell: (row: TipoEquipo) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} title="Editar tipo">
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setTipoToDelete(row)} title="Eliminar tipo">
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Barra de acción */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Clasificación de hardware (Laptop, Computadora de Escritorio, Impresora, Equipamiento de Red, etc.).
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Nuevo Tipo
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={tipos}
          isLoading={isLoading}
          emptyMessage="No hay tipos de equipo registrados"
        />
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTipo ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            id="tipo-nombre"
            label="Nombre del Tipo *"
            placeholder="Ej. Laptop / Portátil"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!editingTipo) {
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }
            }}
          />

          <Input
            id="tipo-slug"
            label="Identificador Único (Slug)"
            placeholder="Ej. laptop, desktop"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div>
            <label htmlFor="tipo-marca" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Marca Preferente / Asociada
            </label>
            <Select
              id="tipo-marca"
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              options={[
                { value: '', label: 'General / Sin marca fija' },
                ...marcas.map((m) => ({ value: String(m.id), label: m.nombre })),
              ]}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Estado</span>
            <button
              type="button"
              onClick={() => setEstado(!estado)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                estado ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              }`}
            >
              {estado ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingTipo ? 'Actualizar' : 'Guardar Tipo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(tipoToDelete)}
        title="Eliminar Tipo de Equipo"
        message={`¿Deseas eliminar el tipo de equipo "${tipoToDelete?.nombre}"?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setTipoToDelete(null)}
      />
    </div>
  );
}
