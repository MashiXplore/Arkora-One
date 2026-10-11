// src/frontend/components/modules/ordenes/OrdenCreateModal.tsx
// Modal para registrar una nueva orden de servicio con validación Zod
// Skill: react-modernization

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrdenSchema, type CreateOrdenInput } from '@/backend/validators/orden.validator';
import { useCreateOrden } from '@/frontend/hooks/useOrdenes';
import { useFuncionarios } from '@/frontend/hooks/useFuncionarios';
import { useEquipos } from '@/frontend/hooks/useEquipos';
import { useUsers } from '@/frontend/hooks/useUsers';
import { Modal, Input, Select, Button, showToast } from '@/frontend/components/ui';
import type { FuncionarioWithRelations } from '@/types/funcionario.types';
import type { EquipoWithRelations } from '@/types/equipo.types';
import type { User } from '@/types/user.types';

export interface OrdenCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEquipoId?: number;
  defaultFuncionarioId?: number;
}

export function OrdenCreateModal({
  isOpen,
  onClose,
  defaultEquipoId,
  defaultFuncionarioId,
}: OrdenCreateModalProps) {
  const createMutation = useCreateOrden();

  const { data: funcionariosData } = useFuncionarios({ pageSize: 100 });
  const { data: equiposData } = useEquipos({ pageSize: 100 });
  const { data: usersData } = useUsers({ pageSize: 100 });

  const funcionarios =
    funcionariosData && 'data' in funcionariosData && Array.isArray(funcionariosData.data)
      ? (funcionariosData.data as FuncionarioWithRelations[])
      : [];

  const equipos =
    equiposData && 'data' in equiposData && Array.isArray(equiposData.data)
      ? (equiposData.data as EquipoWithRelations[])
      : [];

  const users =
    usersData && 'data' in usersData && Array.isArray(usersData.data)
      ? (usersData.data as User[])
      : [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrdenInput>({
    resolver: zodResolver(createOrdenSchema),
    defaultValues: {
      estado: 'creado',
      tipo_servicio: 'reparacion',
      prioridad: 'media',
      id_recepcion: 1, // Fallback, override by session user in backend
      id_tecnico: null,
      id_equipo: defaultEquipoId || undefined,
      id_funcionario: defaultFuncionarioId || undefined,
      diagnostico_inicial: '',
    },
  });

  const selectedFuncionarioId = watch('id_funcionario');

  // Si se selecciona un funcionario y no se ha seleccionado equipo, intentar preseleccionar su equipo asignado
  useEffect(() => {
    if (selectedFuncionarioId && !watch('id_equipo')) {
      const assigned = equipos.find((eq) => eq.funcionario_id === Number(selectedFuncionarioId));
      if (assigned) {
        setValue('id_equipo', assigned.id);
      }
    }
  }, [selectedFuncionarioId, equipos, setValue, watch]);

  // Si se pasa un defaultEquipoId al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (defaultEquipoId) setValue('id_equipo', defaultEquipoId);
      if (defaultFuncionarioId) setValue('id_funcionario', defaultFuncionarioId);
    }
  }, [isOpen, defaultEquipoId, defaultFuncionarioId, setValue]);

  const onSubmit = async (data: CreateOrdenInput) => {
    try {
      const res = await createMutation.mutateAsync(data as unknown as import('@/types/orden.types').CreateOrdenPayload);
      if (res.success) {
        showToast.success('Orden de servicio registrada exitosamente');
        reset();
        onClose();
      } else {
        showToast.error(res.error?.message ?? 'Error al registrar orden');
      }
    } catch {
      showToast.error('Error al procesar la solicitud');
    }
  };

  const funcionarioOptions = [
    { value: '', label: 'Seleccionar funcionario solicitante...' },
    ...funcionarios.map((f) => ({
      value: f.id,
      label: `${f.nombre} (${f.departamento_area || 'Área'} - ${f.agencia?.nombre || 'Agencia'})`,
    })),
  ];

  const equipoOptions = [
    { value: '', label: 'Seleccionar equipo institucional...' },
    ...equipos.map((eq) => ({
      value: eq.id,
      label: `${eq.numero_etiqueta} · ${eq.tipo_equipo?.nombre || 'Equipo'} - ${eq.marca?.nombre} ${eq.modelo?.nombre} (${eq.estado_operativo})`,
    })),
  ];

  const tecnicoOptions = [
    { value: '', label: 'Sin técnico asignado (Pendiente)' },
    ...users
      .filter((u) => u.isActive)
      .map((u) => ({
        value: u.id,
        label: `${u.name} (${u.role?.name || 'Usuario'})`,
      })),
  ];

  const tipoServicioOptions = [
    { value: 'reparacion', label: 'Reparación / Corrección de Falla' },
    { value: 'mantenimiento_preventivo', label: 'Mantenimiento Preventivo Planificado' },
    { value: 'mantenimiento_correctivo', label: 'Mantenimiento Correctivo de Emergencia' },
    { value: 'diagnostico', label: 'Diagnóstico / Revisión Técnica' },
    { value: 'instalacion', label: 'Instalación / Configuración' },
  ];

  const prioridadOptions = [
    { value: 'baja', label: 'Baja (Atención estándar)' },
    { value: 'media', label: 'Media (Atención regular)' },
    { value: 'alta', label: 'Alta (Afecta operaciones)' },
    { value: 'urgente', label: 'Urgente (Bloqueo crítico)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Nueva Orden de Servicio"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Solicitante y Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="orden-funcionario"
              label="Funcionario Solicitante"
              options={funcionarioOptions}
              error={errors.id_funcionario?.message}
              {...register('id_funcionario')}
            />
          </div>

          <div>
            <Select
              id="orden-equipo"
              label="Equipo Institucional"
              options={equipoOptions}
              error={errors.id_equipo?.message}
              {...register('id_equipo')}
            />
          </div>
        </div>

        {/* Tipo de Servicio y Prioridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="orden-tipo-servicio"
              label="Tipo de Servicio"
              options={tipoServicioOptions}
              error={errors.tipo_servicio?.message}
              {...register('tipo_servicio')}
            />
          </div>

          <div>
            <Select
              id="orden-prioridad"
              label="Prioridad"
              options={prioridadOptions}
              error={errors.prioridad?.message}
              {...register('prioridad')}
            />
          </div>
        </div>

        {/* Asignación de Técnico y Fecha Estimada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="orden-tecnico"
              label="Técnico Responsable"
              options={tecnicoOptions}
              error={errors.id_tecnico?.message}
              {...register('id_tecnico')}
            />
          </div>

          <div>
            <Input
              id="orden-fecha-estimada"
              type="date"
              label="Fecha Estimada de Entrega"
              error={errors.fecha_estimada_entrega?.message}
              {...register('fecha_estimada_entrega')}
            />
          </div>
        </div>

        {/* Diagnóstico Inicial */}
        <div>
          <label
            htmlFor="orden-diagnostico"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Diagnóstico Inicial / Motivo de Ingreso
          </label>
          <textarea
            id="orden-diagnostico"
            rows={3}
            placeholder="Describe la falla reportada, síntomas o requerimiento de mantenimiento..."
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            {...register('diagnostico_inicial')}
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            Crear Orden de Servicio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
