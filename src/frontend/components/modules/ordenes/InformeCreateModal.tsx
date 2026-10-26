// src/frontend/components/modules/ordenes/InformeCreateModal.tsx
// Modal para emitir un informe técnico vinculado a una orden de servicio
// Skill: react-modernization

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInformeSchema, type CreateInformeInput } from '@/backend/validators/orden.validator';
import { useCreateInforme, useOrdenes } from '@/frontend/hooks/useOrdenes';
import { useUsers } from '@/frontend/hooks/useUsers';
import { Modal, Input, Select, Button, showToast } from '@/frontend/components/ui';
import type { OrdenWithRelations } from '@/types/orden.types';
import type { User } from '@/types/user.types';

export interface InformeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrden?: OrdenWithRelations | null;
}

export function InformeCreateModal({
  isOpen,
  onClose,
  defaultOrden,
}: InformeCreateModalProps) {
  const createMutation = useCreateInforme();
  const { data: usersData } = useUsers({ pageSize: 100 });
  const { data: ordenesData } = useOrdenes({ pageSize: 100 });

  const users =
    usersData && 'data' in usersData && Array.isArray(usersData.data)
      ? (usersData.data as User[])
      : [];

  const ordenes =
    ordenesData && 'data' in ordenesData && Array.isArray(ordenesData.data)
      ? (ordenesData.data as OrdenWithRelations[])
      : [];

  // Filtrar órdenes que no tengan informe aún (o la preseleccionada)
  const availableOrdenes = ordenes.filter(
    (o) => !o.informe || (defaultOrden && o.id === defaultOrden.id)
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateInformeInput>({
    resolver: zodResolver(createInformeSchema),
    defaultValues: {
      tipo_informe: 'Informe Técnico de Reparación',
      titulo: '',
      diagnostico_final: '',
      solucion_aplicada: '',
      fecha: new Date(),
      user_id: 1,
    },
  });

  const selectedOrdenId = watch('orden_id');

  useEffect(() => {
    if (defaultOrden && isOpen) {
      setValue('orden_id', defaultOrden.id);
      setValue(
        'titulo',
        `Informe Técnico - Orden ${defaultOrden.numero_orden} (${defaultOrden.equipo.numero_etiqueta})`
      );
      if (defaultOrden.id_tecnico) {
        setValue('user_id', defaultOrden.id_tecnico);
      }
      if (defaultOrden.funcionario?.agencia?.id) {
        setValue('agencia_id', defaultOrden.funcionario.agencia.id);
      }
    }
  }, [defaultOrden, isOpen, setValue]);

  const onSubmit = async (data: CreateInformeInput) => {
    try {
      const res = await createMutation.mutateAsync(data as unknown as import('@/types/orden.types').CreateInformePayload);
      if (res.success) {
        showToast.success('Informe técnico generado exitosamente');
        reset();
        onClose();
      } else {
        showToast.error(res.error?.message ?? 'Error al emitir informe');
      }
    } catch {
      showToast.error('Error al procesar la solicitud');
    }
  };

  const tipoInformeOptions = [
    { value: 'Informe Técnico de Reparación', label: 'Informe Técnico de Reparación' },
    { value: 'Mantenimiento Preventivo Periódico', label: 'Mantenimiento Preventivo Periódico' },
    { value: 'Mantenimiento Correctivo de Emergencia', label: 'Mantenimiento Correctivo de Emergencia' },
    { value: 'Dictamen Técnico de Baja', label: 'Dictamen Técnico de Baja / Obsolescencia' },
    { value: 'Informe de Diagnóstico y Evaluación', label: 'Informe de Diagnóstico y Evaluación' },
    { value: 'Acta de Puesta en Marcha', label: 'Acta de Puesta en Marcha / Entrega' },
  ];

  const ordenOptions = [
    { value: '', label: 'Seleccionar orden de servicio...' },
    ...availableOrdenes.map((o) => ({
      value: o.id,
      label: `${o.numero_orden} · [${o.equipo.numero_etiqueta}] ${o.funcionario.nombre} (${o.tipo_servicio})`,
    })),
  ];

  const tecnicoOptions = [
    { value: '', label: 'Seleccionar técnico autor...' },
    ...users
      .filter((u) => u.isActive)
      .map((u) => ({
        value: u.id,
        label: `${u.name} (${u.role?.name || 'Técnico'})`,
      })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Emitir Informe Técnico Oficial"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
        {/* Orden y Técnico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="informe-orden"
              label="Orden de Servicio Asociada"
              options={ordenOptions}
              error={errors.orden_id?.message}
              {...register('orden_id')}
            />
          </div>

          <div>
            <Select
              id="informe-tecnico"
              label="Técnico Responsable del Informe"
              options={tecnicoOptions}
              error={errors.user_id?.message}
              {...register('user_id')}
            />
          </div>
        </div>

        {/* Tipo de Informe y Título */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="informe-tipo"
              label="Tipo de Informe"
              options={tipoInformeOptions}
              error={errors.tipo_informe?.message}
              {...register('tipo_informe')}
            />
          </div>

          <div>
            <Input
              id="informe-fecha"
              type="date"
              label="Fecha de Emisión"
              error={errors.fecha?.message}
              {...register('fecha')}
            />
          </div>
        </div>

        {/* Título del Informe */}
        <div>
          <Input
            id="informe-titulo"
            label="Título del Documento"
            error={errors.titulo?.message}
            {...register('titulo')}
          />
        </div>

        {/* Diagnóstico Final */}
        <div>
          <label
            htmlFor="informe-diag-final"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Diagnóstico Técnico Final / Causa Raíz
          </label>
          <textarea
            id="informe-diag-final"
            rows={3}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            {...register('diagnostico_final')}
          />
        </div>

        {/* Solución Aplicada */}
        <div>
          <label
            htmlFor="informe-solucion"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Solución Aplicada / Trabajos Realizados
          </label>
          <textarea
            id="informe-solucion"
            rows={3}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            {...register('solucion_aplicada')}
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
            Emitir Informe y Finalizar Orden
          </Button>
        </div>
      </form>
    </Modal>
  );
}
