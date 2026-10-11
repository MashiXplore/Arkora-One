// src/frontend/components/modules/equipos/ModelosTab.tsx
// Panel integrado para la gestión de Modelos dentro del módulo de Equipos
// Skill: react-modernization

'use client';

import { useState } from 'react';
import {
  useModelos,
  useMarcas,
  useTiposEquipo,
  useCreateModelo,
  useUpdateModelo,
  useDeleteModelo,
} from '@/frontend/hooks/useEquipos';
import { Table, Badge, Button, Modal, Input, Select, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Plus, Edit2, Trash2, Layers, Laptop } from 'lucide-react';
import type { Modelo } from '@/types/equipo.types';

export function ModelosTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);
  const [modeloToDelete, setModeloToDelete] = useState<Modelo | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [marcaId, setMarcaId] = useState<string>('');
  const [tipoEquipoId, setTipoEquipoId] = useState<string>('');
  const [estado, setEstado] = useState(true);

  const { data: modelosData, isLoading } = useModelos();
  const { data: marcasData } = useMarcas();
  const { data: tiposData } = useTiposEquipo(marcaId ? Number(marcaId) : undefined);

  const createMutation = useCreateModelo();
  const updateMutation = useUpdateModelo();
  const deleteMutation = useDeleteModelo();

  const modelos =
    modelosData && 'success' in modelosData && modelosData.success && Array.isArray(modelosData.data)
      ? modelosData.data
      : [];

  const marcas =
    marcasData && 'success' in marcasData && marcasData.success && Array.isArray(marcasData.data)
      ? marcasData.data
      : [];

  const tipos =
    tiposData && 'success' in tiposData && tiposData.success && Array.isArray(tiposData.data)
      ? tiposData.data
      : [];

  const handleOpenCreate = () => {
    setEditingModelo(null);
    setNombre('');
    setSlug('');
    setMarcaId('');
    setTipoEquipoId('');
    setEstado(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (modelo: Modelo) => {
    setEditingModelo(modelo);
    setNombre(modelo.nombre);
    setSlug(modelo.slug ?? '');
    setMarcaId(String(modelo.marcaId));
    setTipoEquipoId(modelo.tipo_equipo_id ? String(modelo.tipo_equipo_id) : '');
    setEstado(modelo.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast.error('El nombre del modelo es obligatorio');
      return;
    }
    if (!marcaId) {
      showToast.error('Debes seleccionar una marca');
      return;
    }

    try {
      if (editingModelo) {
        const result = await updateMutation.mutateAsync({
          id: editingModelo.id,
          data: {
            nombre,
            slug: slug || undefined,
            marcaId: Number(marcaId),
            tipo_equipo_id: tipoEquipoId ? Number(tipoEquipoId) : null,
            estado,
          },
        });
        if (result.success) {
          showToast.success('Modelo actualizado correctamente');
          setIsModalOpen(false);
        } else {
          showToast.error(result.error?.message ?? 'Error al actualizar');
        }
      } else {
        const result = await createMutation.mutateAsync({
          nombre,
          slug: slug || undefined,
          marcaId: Number(marcaId),
          tipo_equipo_id: tipoEquipoId ? Number(tipoEquipoId) : null,
          estado,
        });
        if (result.success) {
          showToast.success('Modelo creado exitosamente');
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
    if (!modeloToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(modeloToDelete.id);
      if (result.success) {
        showToast.success('Modelo eliminado correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión');
    } finally {
      setModeloToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Modelo',
      accessorKey: 'nombre' as keyof Modelo,
      cell: (row: Modelo) => (
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600 shrink-0" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</span>
            {row.slug && <div className="text-[11px] text-slate-400">slug: {row.slug}</div>}
          </div>
        </div>
      ),
    },
    {
      header: 'Marca Fabricante',
      accessorKey: 'marca' as keyof Modelo,
      cell: (row: Modelo) => (
        <span className="font-semibold text-xs text-purple-600 dark:text-purple-400">
          {row.marca?.nombre}
        </span>
      ),
    },
    {
      header: 'Tipo de Equipo',
      accessorKey: 'tipo_equipo' as keyof Modelo,
      cell: (row: Modelo) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.tipo_equipo?.nombre || 'General'}
        </span>
      ),
    },
    {
      header: 'Unidades Activas',
      accessorKey: 'id' as keyof Modelo,
      cell: (row: Modelo) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Laptop className="w-3 h-3" />
          {row._count?.equipos ?? 0} unidades
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado' as keyof Modelo,
      cell: (row: Modelo) => (
        <Badge variant={row.estado ? 'success' : 'danger'}>
          {row.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof Modelo,
      cell: (row: Modelo) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} title="Editar modelo">
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setModeloToDelete(row)} title="Eliminar modelo">
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
          Modelos específicos por marca y tipo (Latitude 5420, ThinkPad T14, ProDesk 400, etc.).
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Nuevo Modelo
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={modelos}
          isLoading={isLoading}
          emptyMessage="No hay modelos registrados"
        />
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingModelo ? 'Editar Modelo' : 'Nuevo Modelo'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            id="modelo-nombre"
            label="Nombre del Modelo *"
            placeholder="Ej. Latitude 5420, ThinkPad T14"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!editingModelo) {
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }
            }}
          />

          <Input
            id="modelo-slug"
            label="Identificador Único (Slug)"
            placeholder="Ej. latitude-5420"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modelo-marca" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Marca Fabricante *
              </label>
              <Select
                id="modelo-marca"
                value={marcaId}
                onChange={(e) => {
                  setMarcaId(e.target.value);
                  setTipoEquipoId('');
                }}
                options={[
                  { value: '', label: 'Seleccionar marca...' },
                  ...marcas.map((m) => ({ value: String(m.id), label: m.nombre })),
                ]}
              />
            </div>

            <div>
              <label htmlFor="modelo-tipo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tipo de Equipo
              </label>
              <Select
                id="modelo-tipo"
                value={tipoEquipoId}
                onChange={(e) => setTipoEquipoId(e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar tipo...' },
                  ...tipos.map((t) => ({ value: String(t.id), label: t.nombre })),
                ]}
              />
            </div>
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
              {editingModelo ? 'Actualizar' : 'Guardar Modelo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(modeloToDelete)}
        title="Eliminar Modelo"
        message={`¿Deseas eliminar el modelo "${modeloToDelete?.nombre}"?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setModeloToDelete(null)}
      />
    </div>
  );
}
