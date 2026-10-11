// src/frontend/components/modules/funcionarios/FuncionarioEditModal.tsx
// Modal de edición de funcionario con validación Zod y React Hook Form
// Skill: react-modernization

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateFuncionarioSchema, type UpdateFuncionarioInput } from '@/backend/validators/funcionario.validator';
import { useUpdateFuncionario, useSucursales, useAgencias, useCargos } from '@/frontend/hooks/useFuncionarios';
import { Modal, Input, Select, Button, showToast } from '@/frontend/components/ui';
import type { FuncionarioWithRelations } from '@/types/funcionario.types';

export interface FuncionarioEditModalProps {
  isOpen: boolean;
  funcionario: FuncionarioWithRelations | null;
  onClose: () => void;
}

export function FuncionarioEditModal({ isOpen, funcionario, onClose }: FuncionarioEditModalProps) {
  const [selectedSucursal, setSelectedSucursal] = useState<string>('');
  const updateMutation = useUpdateFuncionario();

  const { data: sucursalesData } = useSucursales();
  const { data: agenciasData } = useAgencias(selectedSucursal ? Number(selectedSucursal) : undefined);
  const { data: cargosData } = useCargos();

  const sucursales =
    sucursalesData && 'success' in sucursalesData && sucursalesData.success && Array.isArray(sucursalesData.data)
      ? sucursalesData.data
      : [];

  const agencias =
    agenciasData && 'success' in agenciasData && agenciasData.success && Array.isArray(agenciasData.data)
      ? agenciasData.data
      : [];

  const cargos =
    cargosData && 'success' in cargosData && cargosData.success && Array.isArray(cargosData.data)
      ? cargosData.data
      : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFuncionarioInput>({
    resolver: zodResolver(updateFuncionarioSchema),
  });

  useEffect(() => {
    if (funcionario) {
      reset({
        nombre: funcionario.nombre,
        correo: funcionario.correo ?? '',
        telefono: funcionario.telefono ?? '',
        departamento_area: funcionario.departamento_area ?? '',
        cargoId: funcionario.cargoId,
        agenciaId: funcionario.agenciaId,
        estado: funcionario.estado,
      });
      if (funcionario.agencia?.sucursalId) {
        setSelectedSucursal(String(funcionario.agencia.sucursalId));
      }
    }
  }, [funcionario, reset]);

  const onSubmit = async (data: UpdateFuncionarioInput) => {
    if (!funcionario) return;
    try {
      const result = await updateMutation.mutateAsync({ id: funcionario.id, data });
      if (result.success) {
        showToast.success('Funcionario actualizado exitosamente');
        onClose();
      } else {
        showToast.error(result.error?.message ?? 'Error al actualizar');
      }
    } catch {
      showToast.error('Error de conexión al actualizar el funcionario');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Funcionario"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Nombre */}
        <Input
          id="edit-func-nombre"
          label="Nombre Completo *"
          placeholder="Ej. Roberto Morales Vargas"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        {/* Correo y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="edit-func-correo"
            label="Correo Electrónico"
            type="email"
            placeholder="rmorales@diaconia.org.bo"
            error={errors.correo?.message}
            {...register('correo')}
          />
          <Input
            id="edit-func-telefono"
            label="Teléfono / Celular"
            placeholder="Ej. 71234567"
            error={errors.telefono?.message}
            {...register('telefono')}
          />
        </div>

        {/* Departamento / Área */}
        <Input
          id="edit-func-depto"
          label="Departamento o Área"
          placeholder="Ej. Operaciones, Créditos, Tecnología"
          error={errors.departamento_area?.message}
          {...register('departamento_area')}
        />

        {/* Cargo */}
        <div>
          <label htmlFor="edit-func-cargo" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cargo / Puesto *
          </label>
          <Select
            id="edit-func-cargo"
            error={errors.cargoId?.message}
            options={[
              { value: '', label: 'Seleccionar cargo...' },
              ...cargos.map((c) => ({ value: String(c.id), label: c.nombre })),
            ]}
            {...register('cargoId')}
          />
        </div>

        {/* Sucursal y Agencia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="edit-func-sucursal" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Sucursal Regional
            </label>
            <Select
              id="edit-func-sucursal"
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              options={[
                { value: '', label: 'Todas las sucursales...' },
                ...sucursales.map((s) => ({ value: String(s.id), label: s.nombre })),
              ]}
            />
          </div>

          <div>
            <label htmlFor="edit-func-agencia" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Agencia Asignada *
            </label>
            <Select
              id="edit-func-agencia"
              error={errors.agenciaId?.message}
              options={[
                { value: '', label: 'Seleccionar agencia...' },
                ...agencias.map((a) => ({ value: String(a.id), label: a.nombre })),
              ]}
              {...register('agenciaId')}
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="edit-func-estado" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Estado
          </label>
          <Select
            id="edit-func-estado"
            options={[
              { value: 'true', label: 'Activo' },
              { value: 'false', label: 'Inactivo' },
            ]}
            {...register('estado', {
              setValueAs: (v) => v === 'true' || v === true,
            })}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting || updateMutation.isPending}>
            Actualizar Funcionario
          </Button>
        </div>
      </form>
    </Modal>
  );
}
