// src/frontend/components/modules/funcionarios/FuncionarioCreateModal.tsx
// Modal de creación de funcionario con validación Zod y React Hook Form
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFuncionarioSchema, type CreateFuncionarioInput } from '@/backend/validators/funcionario.validator';
import { useCreateFuncionario, useSucursales, useAgencias, useCargos } from '@/frontend/hooks/useFuncionarios';
import { Modal, Input, Select, Button, showToast } from '@/frontend/components/ui';

export interface FuncionarioCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FuncionarioCreateModal({ isOpen, onClose }: FuncionarioCreateModalProps) {
  const [selectedSucursal, setSelectedSucursal] = useState<string>('');
  const createMutation = useCreateFuncionario();

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
  } = useForm<CreateFuncionarioInput>({
    resolver: zodResolver(createFuncionarioSchema),
    defaultValues: {
      estado: true,
    },
  });

  const onSubmit = async (data: CreateFuncionarioInput) => {
    try {
      const result = await createMutation.mutateAsync(data);
      if (result.success) {
        showToast.success('Funcionario creado exitosamente');
        reset();
        setSelectedSucursal('');
        onClose();
      } else {
        showToast.error(result.error?.message ?? 'Error al crear el funcionario');
      }
    } catch {
      showToast.error('Error de conexión al guardar el funcionario');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedSucursal('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Funcionario"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-3.5" noValidate>
        {/* Nombre */}
        <Input
          id="create-func-nombre"
          label="Nombre Completo *"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        {/* Correo y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="create-func-correo"
            label="Correo Electrónico"
            type="email"
            error={errors.correo?.message}
            {...register('correo')}
          />
          <Input
            id="create-func-telefono"
            label="Teléfono / Celular"
            error={errors.telefono?.message}
            {...register('telefono')}
          />
        </div>

        {/* Departamento / Área */}
        <Input
          id="create-func-depto"
          label="Departamento o Área"
          error={errors.departamento_area?.message}
          {...register('departamento_area')}
        />

        {/* Cargo */}
        <div>
          <label htmlFor="create-func-cargo" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cargo / Puesto *
          </label>
          <Select
            id="create-func-cargo"
            error={errors.cargoId?.message}
            options={[
              { value: '', label: 'Seleccionar cargo...' },
              ...cargos.map((c) => ({ value: String(c.id), label: c.nombre })),
            ]}
            {...register('cargoId')}
          />
        </div>

        {/* Sucursal (filtro selector) y Agencia asignada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="create-func-sucursal" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Sucursal Regional
            </label>
            <Select
              id="create-func-sucursal"
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              options={[
                { value: '', label: 'Todas las sucursales...' },
                ...sucursales.map((s) => ({ value: String(s.id), label: s.nombre })),
              ]}
            />
          </div>

          <div>
            <label htmlFor="create-func-agencia" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Agencia Asignada *
            </label>
            <Select
              id="create-func-agencia"
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
          <label htmlFor="create-func-estado" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Estado
          </label>
          <Select
            id="create-func-estado"
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
          <Button variant="outline" size="sm" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting || createMutation.isPending}>
            Guardar Funcionario
          </Button>
        </div>
      </form>
    </Modal>
  );
}
