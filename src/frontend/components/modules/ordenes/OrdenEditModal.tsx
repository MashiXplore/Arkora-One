// src/frontend/components/modules/ordenes/OrdenEditModal.tsx
// Modal para editar el estado, asignación y detalles de una orden de servicio
// Skill: react-modernization

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateOrdenSchema, type UpdateOrdenInput } from '@/backend/validators/orden.validator';
import { useUpdateOrden } from '@/frontend/hooks/useOrdenes';
import { useUsers } from '@/frontend/hooks/useUsers';
import { Modal, Input, Select, Button, showToast } from '@/frontend/components/ui';
import type { OrdenWithRelations } from '@/types/orden.types';
import type { User } from '@/types/user.types';

export interface OrdenEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenWithRelations | null;
}

export function OrdenEditModal({ isOpen, onClose, orden }: OrdenEditModalProps) {
  const updateMutation = useUpdateOrden();
  const { data: usersData } = useUsers({ pageSize: 100 });

  const users =
    usersData && 'data' in usersData && Array.isArray(usersData.data)
      ? (usersData.data as User[])
      : [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateOrdenInput>({
    resolver: zodResolver(updateOrdenSchema),
  });

  useEffect(() => {
    if (orden && isOpen) {
      setValue('estado', orden.estado);
      setValue('tipo_servicio', orden.tipo_servicio);
      setValue('prioridad', orden.prioridad);
      setValue('id_tecnico', orden.id_tecnico || null);
      setValue('diagnostico_inicial', orden.diagnostico_inicial || '');
      setValue(
        'fecha_estimada_entrega',
        orden.fecha_estimada_entrega ? new Date(orden.fecha_estimada_entrega) : null
      );
    }
  }, [orden, isOpen, setValue]);

  const onSubmit = async (data: UpdateOrdenInput) => {
    if (!orden) return;
    try {
      const res = await updateMutation.mutateAsync({
        id: orden.id,
        data: data as unknown as import('@/types/orden.types').UpdateOrdenPayload,
      });
      if (res.success) {
        showToast.success('Orden de servicio actualizada correctamente');
        reset();
        onClose();
      } else {
        showToast.error(res.error?.message ?? 'Error al actualizar orden');
      }
    } catch {
      showToast.error('Error al procesar la solicitud');
    }
  };

  const estadoOptions = [
    { value: 'creado', label: 'Creado / En Espera' },
    { value: 'en_proceso', label: 'En Proceso / Diagnóstico' },
    { value: 'finalizado', label: 'Finalizado / Reparado' },
    { value: 'entregado', label: 'Entregado al Funcionario' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  const tecnicoOptions = [
    { value: '', label: 'Sin técnico asignado' },
    ...users
      .filter((u) => u.isActive)
      .map((u) => ({
        value: u.id,
        label: `${u.name} (${u.role?.name || 'Usuario'})`,
      })),
  ];

  const tipoServicioOptions = [
    { value: 'instalacion', label: 'Software (S.O., Programas, Configuración)' },
    { value: 'reparacion', label: 'Hardware (Componentes, Reparación, Piezas)' },
    { value: 'diagnostico', label: 'Diagnóstico General (Revisión Técnica)' },
  ];

  const prioridadOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title={`Editar Orden ${orden?.numero_orden || ''}`}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
        {/* Resumen Informativo de Solo Lectura */}
        {orden && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold block text-slate-400">Equipo:</span>
              <span className="font-mono font-medium">{orden.equipo.numero_etiqueta}</span> ({orden.equipo.marca?.nombre} {orden.equipo.modelo?.nombre})
            </div>
            <div>
              <span className="font-semibold block text-slate-400">Solicitante:</span>
              <span>{orden.funcionario.nombre}</span> ({orden.funcionario.departamento_area || 'Área'})
            </div>
          </div>
        )}

        {/* Estado y Técnico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="edit-orden-estado"
              label="Estado de la Orden"
              options={estadoOptions}
              error={errors.estado?.message}
              {...register('estado')}
            />
          </div>

          <div>
            <Select
              id="edit-orden-tecnico"
              label="Técnico Asignado"
              options={tecnicoOptions}
              error={errors.id_tecnico?.message}
              {...register('id_tecnico')}
            />
          </div>
        </div>

        {/* Tipo de Servicio y Prioridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="edit-orden-tipo"
              label="Tipo de Servicio"
              options={tipoServicioOptions}
              error={errors.tipo_servicio?.message}
              {...register('tipo_servicio')}
            />
          </div>

          <div>
            <Select
              id="edit-orden-prioridad"
              label="Prioridad"
              options={prioridadOptions}
              error={errors.prioridad?.message}
              {...register('prioridad')}
            />
          </div>
        </div>

        {/* Fecha Estimada */}
        <div>
          <Input
            id="edit-orden-fecha-estimada"
            type="date"
            label="Fecha Estimada de Entrega"
            error={errors.fecha_estimada_entrega?.message}
            {...register('fecha_estimada_entrega')}
          />
        </div>

        {/* Diagnóstico Inicial */}
        <div>
          <label
            htmlFor="edit-orden-diagnostico"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Diagnóstico / Observaciones
          </label>
          <textarea
            id="edit-orden-diagnostico"
            rows={3}
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
