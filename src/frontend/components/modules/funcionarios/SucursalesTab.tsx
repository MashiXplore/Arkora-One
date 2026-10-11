// src/frontend/components/modules/funcionarios/SucursalesTab.tsx
// Panel integrado para la gestión de Sucursales dentro del módulo de Funcionarios
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useSucursales, useCreateSucursal, useUpdateSucursal, useDeleteSucursal } from '@/frontend/hooks/useFuncionarios';
import { Table, Badge, Button, Modal, Input, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Plus, Edit2, Trash2, Building2, MapPin, Phone } from 'lucide-react';
import type { Sucursal } from '@/types/funcionario.types';

export function SucursalesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [sucursalToDelete, setSucursalToDelete] = useState<Sucursal | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState(true);

  const { data, isLoading } = useSucursales();
  const createMutation = useCreateSucursal();
  const updateMutation = useUpdateSucursal();
  const deleteMutation = useDeleteSucursal();

  const sucursales =
    data && 'success' in data && data.success && Array.isArray(data.data) ? data.data : [];

  const handleOpenCreate = () => {
    setEditingSucursal(null);
    setNombre('');
    setDireccion('');
    setTelefono('');
    setEstado(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sucursal: Sucursal) => {
    setEditingSucursal(sucursal);
    setNombre(sucursal.nombre);
    setDireccion(sucursal.direccion ?? '');
    setTelefono(sucursal.telefono ?? '');
    setEstado(sucursal.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast.error('El nombre de la sucursal es obligatorio');
      return;
    }

    try {
      if (editingSucursal) {
        const result = await updateMutation.mutateAsync({
          id: editingSucursal.id,
          data: { nombre, direccion, telefono, estado },
        });
        if (result.success) {
          showToast.success('Sucursal actualizada correctamente');
          setIsModalOpen(false);
        } else {
          showToast.error(result.error?.message ?? 'Error al actualizar');
        }
      } else {
        const result = await createMutation.mutateAsync({
          nombre,
          direccion,
          telefono,
          estado,
        });
        if (result.success) {
          showToast.success('Sucursal creada exitosamente');
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
    if (!sucursalToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(sucursalToDelete.id);
      if (result.success) {
        showToast.success('Sucursal eliminada');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión');
    } finally {
      setSucursalToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Sucursal Regional',
      accessorKey: 'nombre' as keyof Sucursal,
      cell: (row: Sucursal) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</span>
        </div>
      ),
    },
    {
      header: 'Dirección',
      accessorKey: 'direccion' as keyof Sucursal,
      cell: (row: Sucursal) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{row.direccion || 'Sin dirección registrada'}</span>
        </div>
      ),
    },
    {
      header: 'Teléfono',
      accessorKey: 'telefono' as keyof Sucursal,
      cell: (row: Sucursal) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{row.telefono || 'Sin teléfono'}</span>
        </div>
      ),
    },
    {
      header: 'Agencias',
      accessorKey: 'id' as keyof Sucursal,
      cell: (row: Sucursal) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          {row._count?.agencias ?? 0} agencias
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado' as keyof Sucursal,
      cell: (row: Sucursal) => (
        <Badge variant={row.estado ? 'success' : 'danger'}>
          {row.estado ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof Sucursal,
      cell: (row: Sucursal) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} title="Editar sucursal">
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSucursalToDelete(row)} title="Eliminar sucursal">
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Barra de acción secundaria */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Las sucursales representan las oficinas regionales principales que agrupan agencias.
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Nueva Sucursal
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={sucursales}
          isLoading={isLoading}
          emptyMessage="No hay sucursales registradas"
        />
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            id="sucursal-nombre"
            label="Nombre de la Sucursal *"
            placeholder="Ej. Sucursal La Paz"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            id="sucursal-direccion"
            label="Dirección Principal"
            placeholder="Ej. Av. Mariscal Santa Cruz #1234"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <Input
            id="sucursal-telefono"
            label="Teléfono de Contacto"
            placeholder="Ej. 22401122"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
              {editingSucursal ? 'Actualizar' : 'Guardar Sucursal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(sucursalToDelete)}
        title="Eliminar Sucursal"
        message={`¿Deseas eliminar la sucursal "${sucursalToDelete?.nombre}"? Las agencias asociadas quedarán desvinculadas.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setSucursalToDelete(null)}
      />
    </div>
  );
}
