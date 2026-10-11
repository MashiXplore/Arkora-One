// src/frontend/components/modules/equipos/MarcasTab.tsx
// Panel integrado para la gestión de Marcas dentro del módulo de Equipos
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useMarcas, useCreateMarca, useUpdateMarca, useDeleteMarca } from '@/frontend/hooks/useEquipos';
import { Table, Badge, Button, Modal, Input, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Plus, Edit2, Trash2, Layers, Laptop } from 'lucide-react';
import type { Marca } from '@/types/equipo.types';

export function MarcasTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
  const [marcaToDelete, setMarcaToDelete] = useState<Marca | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [estado, setEstado] = useState(true);

  const { data, isLoading } = useMarcas();
  const createMutation = useCreateMarca();
  const updateMutation = useUpdateMarca();
  const deleteMutation = useDeleteMarca();

  const marcas =
    data && 'success' in data && data.success && Array.isArray(data.data) ? data.data : [];

  const handleOpenCreate = () => {
    setEditingMarca(null);
    setNombre('');
    setSlug('');
    setEstado(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (marca: Marca) => {
    setEditingMarca(marca);
    setNombre(marca.nombre);
    setSlug(marca.slug);
    setEstado(marca.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast.error('El nombre de la marca es obligatorio');
      return;
    }

    try {
      if (editingMarca) {
        const result = await updateMutation.mutateAsync({
          id: editingMarca.id,
          data: { nombre, slug: slug || undefined, estado },
        });
        if (result.success) {
          showToast.success('Marca actualizada correctamente');
          setIsModalOpen(false);
        } else {
          showToast.error(result.error?.message ?? 'Error al actualizar');
        }
      } else {
        const result = await createMutation.mutateAsync({
          nombre,
          slug: slug || undefined,
          estado,
        });
        if (result.success) {
          showToast.success('Marca creada exitosamente');
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
    if (!marcaToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(marcaToDelete.id);
      if (result.success) {
        showToast.success('Marca eliminada correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión');
    } finally {
      setMarcaToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Marca Fabricante',
      accessorKey: 'nombre' as keyof Marca,
      cell: (row: Marca) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
            {row.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</span>
            <div className="text-[11px] text-slate-400">slug: {row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Modelos Registrados',
      accessorKey: 'id' as keyof Marca,
      cell: (row: Marca) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <Layers className="w-3 h-3" />
          {row._count?.modelos ?? 0} modelos
        </span>
      ),
    },
    {
      header: 'Equipos Asociados',
      accessorKey: 'id' as keyof Marca,
      cell: (row: Marca) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Laptop className="w-3 h-3" />
          {row._count?.equipos ?? 0} unidades
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado' as keyof Marca,
      cell: (row: Marca) => (
        <Badge variant={row.estado ? 'success' : 'danger'}>
          {row.estado ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof Marca,
      cell: (row: Marca) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} title="Editar marca">
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMarcaToDelete(row)} title="Eliminar marca">
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
          Fabricantes de hardware (Dell, HP, Lenovo, Cisco, Epson, etc.).
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Nueva Marca
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={marcas}
          isLoading={isLoading}
          emptyMessage="No hay marcas registradas"
        />
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMarca ? 'Editar Marca' : 'Nueva Marca'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            id="marca-nombre"
            label="Nombre de la Marca *"
            placeholder="Ej. Dell, Lenovo, HP"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!editingMarca) {
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }
            }}
          />
          <Input
            id="marca-slug"
            label="Identificador Único (Slug)"
            placeholder="Ej. dell, lenovo"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Estado</span>
            <button
              type="button"
              onClick={() => setEstado(!estado)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                estado ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              }`}
            >
              {estado ? 'Activa' : 'Inactiva'}
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
              {editingMarca ? 'Actualizar' : 'Guardar Marca'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(marcaToDelete)}
        title="Eliminar Marca"
        message={`¿Deseas eliminar la marca "${marcaToDelete?.nombre}"?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setMarcaToDelete(null)}
      />
    </div>
  );
}
