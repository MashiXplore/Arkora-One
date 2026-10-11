// src/frontend/components/modules/funcionarios/CargosTab.tsx
// Panel integrado para la gestión de Cargos dentro del módulo de Funcionarios
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useCargos, useCreateCargo, useUpdateCargo, useDeleteCargo } from '@/frontend/hooks/useFuncionarios';
import { Table, Badge, Button, Modal, Input, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Plus, Edit2, Trash2, Briefcase, Users } from 'lucide-react';
import type { Cargo } from '@/types/funcionario.types';

export function CargosTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [cargoToDelete, setCargoToDelete] = useState<Cargo | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState(true);

  const { data, isLoading } = useCargos();
  const createMutation = useCreateCargo();
  const updateMutation = useUpdateCargo();
  const deleteMutation = useDeleteCargo();

  const cargos =
    data && 'success' in data && data.success && Array.isArray(data.data) ? data.data : [];

  const handleOpenCreate = () => {
    setEditingCargo(null);
    setNombre('');
    setDescripcion('');
    setEstado(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setNombre(cargo.nombre);
    setDescripcion(cargo.descripcion ?? '');
    setEstado(cargo.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast.error('El nombre del cargo es obligatorio');
      return;
    }

    try {
      if (editingCargo) {
        const result = await updateMutation.mutateAsync({
          id: editingCargo.id,
          data: { nombre, descripcion, estado },
        });
        if (result.success) {
          showToast.success('Cargo actualizado correctamente');
          setIsModalOpen(false);
        } else {
          showToast.error(result.error?.message ?? 'Error al actualizar');
        }
      } else {
        const result = await createMutation.mutateAsync({
          nombre,
          descripcion,
          estado,
        });
        if (result.success) {
          showToast.success('Cargo creado exitosamente');
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
    if (!cargoToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(cargoToDelete.id);
      if (result.success) {
        showToast.success('Cargo eliminado correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión');
    } finally {
      setCargoToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Cargo / Puesto',
      accessorKey: 'nombre' as keyof Cargo,
      cell: (row: Cargo) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</span>
        </div>
      ),
    },
    {
      header: 'Descripción',
      accessorKey: 'descripcion' as keyof Cargo,
      cell: (row: Cargo) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.descripcion || 'Sin descripción'}
        </span>
      ),
    },
    {
      header: 'Funcionarios en el Cargo',
      accessorKey: 'id' as keyof Cargo,
      cell: (row: Cargo) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <Users className="w-3 h-3" />
          {row._count?.funcionarios ?? 0} asignados
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado' as keyof Cargo,
      cell: (row: Cargo) => (
        <Badge variant={row.estado ? 'success' : 'danger'}>
          {row.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof Cargo,
      cell: (row: Cargo) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} title="Editar cargo">
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCargoToDelete(row)} title="Eliminar cargo">
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
          Catálogo institucional de cargos y perfiles para asignar a los funcionarios.
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Nuevo Cargo
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={cargos}
          isLoading={isLoading}
          emptyMessage="No hay cargos registrados"
        />
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCargo ? 'Editar Cargo' : 'Nuevo Cargo'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            id="cargo-nombre"
            label="Nombre del Cargo *"
            placeholder="Ej. Oficial de Crédito"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            id="cargo-descripcion"
            label="Descripción del Puesto"
            placeholder="Ej. Evaluación y seguimiento de colocación de microcréditos"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Estado</span>
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
              {editingCargo ? 'Actualizar' : 'Guardar Cargo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(cargoToDelete)}
        title="Eliminar Cargo"
        message={`¿Deseas eliminar el cargo "${cargoToDelete?.nombre}"?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setCargoToDelete(null)}
      />
    </div>
  );
}
