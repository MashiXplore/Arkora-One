// src/frontend/components/modules/funcionarios/AgenciasTab.tsx
// Panel integrado para la gestión de Agencias dentro del módulo de Funcionarios
// Skill: react-modernization

'use client';

import { useState } from 'react';
import {
  useAgencias,
  useSucursales,
  useCreateAgencia,
  useUpdateAgencia,
  useDeleteAgencia,
} from '@/frontend/hooks/useFuncionarios';
import { Table, Badge, Button, Modal, Input, Select, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Plus, Edit2, Trash2, Building, MapPin, Phone, Users } from 'lucide-react';
import type { Agencia } from '@/types/funcionario.types';

export function AgenciasTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgencia, setEditingAgencia] = useState<Agencia | null>(null);
  const [agenciaToDelete, setAgenciaToDelete] = useState<Agencia | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sucursalId, setSucursalId] = useState<string>('');
  const [estado, setEstado] = useState(true);

  const { data: agenciasData, isLoading } = useAgencias();
  const { data: sucursalesData } = useSucursales();

  const createMutation = useCreateAgencia();
  const updateMutation = useUpdateAgencia();
  const deleteMutation = useDeleteAgencia();

  const agencias =
    agenciasData && 'success' in agenciasData && agenciasData.success && Array.isArray(agenciasData.data)
      ? agenciasData.data
      : [];

  const sucursales =
    sucursalesData && 'success' in sucursalesData && sucursalesData.success && Array.isArray(sucursalesData.data)
      ? sucursalesData.data
      : [];

  const handleOpenCreate = () => {
    setEditingAgencia(null);
    setNombre('');
    setDireccion('');
    setTelefono('');
    setSucursalId('');
    setEstado(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (agencia: Agencia) => {
    setEditingAgencia(agencia);
    setNombre(agencia.nombre);
    setDireccion(agencia.direccion ?? '');
    setTelefono(agencia.telefono ?? '');
    setSucursalId(agencia.sucursalId ? String(agencia.sucursalId) : '');
    setEstado(agencia.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast.error('El nombre de la agencia es obligatorio');
      return;
    }

    try {
      if (editingAgencia) {
        const result = await updateMutation.mutateAsync({
          id: editingAgencia.id,
          data: {
            nombre,
            direccion,
            telefono,
            sucursalId: sucursalId ? Number(sucursalId) : null,
            estado,
          },
        });
        if (result.success) {
          showToast.success('Agencia actualizada correctamente');
          setIsModalOpen(false);
        } else {
          showToast.error(result.error?.message ?? 'Error al actualizar');
        }
      } else {
        const result = await createMutation.mutateAsync({
          nombre,
          direccion,
          telefono,
          sucursalId: sucursalId ? Number(sucursalId) : null,
          estado,
        });
        if (result.success) {
          showToast.success('Agencia creada exitosamente');
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
    if (!agenciaToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(agenciaToDelete.id);
      if (result.success) {
        showToast.success('Agencia eliminada correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar');
      }
    } catch {
      showToast.error('Error de conexión');
    } finally {
      setAgenciaToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Agencia',
      accessorKey: 'nombre' as keyof Agencia,
      cell: (row: Agencia) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</span>
        </div>
      ),
    },
    {
      header: 'Sucursal Regional',
      accessorKey: 'sucursal' as keyof Agencia,
      cell: (row: Agencia) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.sucursal?.nombre ?? 'Sin sucursal asignada'}
        </span>
      ),
    },
    {
      header: 'Contacto y Ubicación',
      accessorKey: 'direccion' as keyof Agencia,
      cell: (row: Agencia) => (
        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
          {row.direccion && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.direccion}</span>
            </div>
          )}
          {row.telefono && (
            <div className="flex items-center gap-1 text-slate-500">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.telefono}</span>
            </div>
          )}
          {!row.direccion && !row.telefono && <span className="text-slate-400">Sin datos</span>}
        </div>
      ),
    },
    {
      header: 'Personal Asignado',
      accessorKey: 'id' as keyof Agencia,
      cell: (row: Agencia) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Users className="w-3 h-3" />
          {row._count?.funcionarios ?? 0} funcionarios
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado' as keyof Agencia,
      cell: (row: Agencia) => (
        <Badge variant={row.estado ? 'success' : 'danger'}>
          {row.estado ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as keyof Agencia,
      cell: (row: Agencia) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} title="Editar agencia">
            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAgenciaToDelete(row)} title="Eliminar agencia">
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
          Una sucursal puede tener varias agencias. Cada agencia aloja el personal operativo.
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Nueva Agencia
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={agencias}
          isLoading={isLoading}
          emptyMessage="No hay agencias registradas"
        />
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgencia ? 'Editar Agencia' : 'Nueva Agencia'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            id="agencia-nombre"
            label="Nombre de la Agencia *"
            placeholder="Ej. Agencia Central La Paz"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <div>
            <label htmlFor="agencia-sucursal" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Sucursal Regional de Pertenencia
            </label>
            <Select
              id="agencia-sucursal"
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value)}
              options={[
                { value: '', label: 'Seleccionar sucursal...' },
                ...sucursales.map((s) => ({ value: String(s.id), label: s.nombre })),
              ]}
            />
          </div>

          <Input
            id="agencia-direccion"
            label="Dirección"
            placeholder="Ej. Calle 15 de Calacoto #8000"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <Input
            id="agencia-telefono"
            label="Teléfono"
            placeholder="Ej. 22791100"
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
              {editingAgencia ? 'Actualizar' : 'Guardar Agencia'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(agenciaToDelete)}
        title="Eliminar Agencia"
        message={`¿Deseas eliminar la agencia "${agenciaToDelete?.nombre}"?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setAgenciaToDelete(null)}
      />
    </div>
  );
}
