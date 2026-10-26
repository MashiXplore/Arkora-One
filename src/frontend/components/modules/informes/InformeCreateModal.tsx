// src/frontend/components/modules/informes/InformeCreateModal.tsx
// Modal para emitir un Informe Técnico vinculado a una Orden de Servicio abierta
// Incluye selector de fotografía: Usar foto registrada del equipo o Subir nueva foto
// Regla: Si la orden está cerrada, no se permite emitir informe

'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInformeSchema, type CreateInformeInput } from '@/backend/validators/orden.validator';
import { useCreateInforme, useOrdenes } from '@/frontend/hooks/useOrdenes';
import { useUsers } from '@/frontend/hooks/useUsers';
import { Modal, Input, Select, Button, showToast } from '@/frontend/components/ui';
import {
  AlertCircle,
  FilePlus,
  Wrench,
  Camera,
  UploadCloud,
  X,
  Check,
  Image as ImageIcon,
  Laptop,
} from 'lucide-react';
import type { OrdenWithRelations, CreateInformePayload } from '@/types/orden.types';
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
  const { data: ordenesData } = useOrdenes({ pageSize: 150 });

  const [photoOption, setPhotoOption] = useState<'equipo' | 'nueva' | 'ninguna'>('equipo');
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const users =
    usersData && 'data' in usersData && Array.isArray(usersData.data)
      ? (usersData.data as User[])
      : [];

  const ordenes =
    ordenesData && 'data' in ordenesData && Array.isArray(ordenesData.data)
      ? (ordenesData.data as OrdenWithRelations[])
      : [];

  // FILTRADO ESTRICTO: Solo órdenes que NO estén cerradas y que no tengan informe
  const availableOrdenes = ordenes.filter((o) => {
    const isClosed = o.estado === 'finalizado' || o.estado === 'entregado' || o.estado === 'cancelado';
    if (isClosed) return false;
    if (o.informe && (!defaultOrden || o.id !== defaultOrden.id)) return false;
    return true;
  });

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
      tipo_informe: 'Reparación Grave / Falla de Componentes',
      titulo: '',
      diagnostico_final: '',
      solucion_aplicada: '',
      fecha: new Date(),
      user_id: 1,
    },
  });

  const selectedOrdenId = watch('orden_id');
  const currentOrden = defaultOrden || ordenes.find((o) => o.id === Number(selectedOrdenId));
  const existingEquipoImg = currentOrden?.equipo?.imagen || null;

  // Actualizar modo de foto cuando cambie el equipo
  useEffect(() => {
    if (existingEquipoImg) {
      setPhotoOption('equipo');
    } else {
      setPhotoOption((prev) => (prev === 'equipo' ? 'nueva' : prev));
    }
  }, [existingEquipoImg]);

  // Validar si la orden seleccionada por defecto está cerrada
  const isDefaultOrdenClosed =
    defaultOrden &&
    (defaultOrden.estado === 'finalizado' ||
      defaultOrden.estado === 'entregado' ||
      defaultOrden.estado === 'cancelado');

  useEffect(() => {
    if (defaultOrden && isOpen) {
      if (isDefaultOrdenClosed) {
        showToast.error('Esta orden ya está cerrada y no puede convertirse en informe técnico.');
        onClose();
        return;
      }

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
  }, [defaultOrden, isOpen, isDefaultOrdenClosed, setValue, onClose]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast.error('La imagen no debe superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result as string);
        setPhotoOption('nueva');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewPhoto = () => {
    setNewPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (existingEquipoImg) {
      setPhotoOption('equipo');
    } else {
      setPhotoOption('ninguna');
    }
  };

  const handleModalClose = () => {
    reset();
    setNewPhotoPreview(null);
    setPhotoOption('equipo');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const onSubmit = async (data: CreateInformeInput) => {
    try {
      const payload: CreateInformePayload = {
        ...data,
        foto_opcion: photoOption,
        nueva_foto_equipo: photoOption === 'nueva' ? newPhotoPreview : null,
      };

      const res = await createMutation.mutateAsync(payload);
      if (res.success) {
        showToast.success('Informe técnico generado exitosamente');
        handleModalClose();
      } else {
        showToast.error(res.error?.message ?? 'Error al emitir informe');
      }
    } catch {
      showToast.error('Error al procesar la solicitud');
    }
  };

  const tipoInformeOptions = [
    {
      value: 'Reparación Grave / Falla de Componentes',
      label: 'Reparación Grave / Falla de Componentes',
    },
    {
      value: 'Reemplazo y Cambio de Piezas',
      label: 'Reemplazo y Cambio de Piezas / Repuestos',
    },
    {
      value: 'Dictamen Técnico de Baja / Obsolescencia',
      label: 'Dictamen Técnico de Baja / Obsolescencia',
    },
    {
      value: 'Mantenimiento Correctivo Especializado',
      label: 'Mantenimiento Correctivo Especializado',
    },
    {
      value: 'Informe de Diagnóstico y Evaluación',
      label: 'Informe de Diagnóstico y Evaluación',
    },
  ];

  const ordenOptions = [
    { value: '', label: 'Seleccionar orden de servicio activa...' },
    ...availableOrdenes.map((o) => ({
      value: String(o.id),
      label: `${o.numero_orden} · [${o.equipo.numero_etiqueta}] ${o.funcionario.nombre} (${o.tipo_servicio})`,
    })),
  ];

  const tecnicoOptions = [
    { value: '', label: 'Seleccionar técnico responsable...' },
    ...users
      .filter((u) => u.isActive)
      .map((u) => ({
        value: String(u.id),
        label: `${u.name} (${u.role?.name || 'Técnico'})`,
      })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Emitir Informe Técnico Oficial"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-3.5 text-xs">
        {/* Aviso de negocio */}
        <div className="flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            Los informes técnicos se emiten para órdenes que requieren diagnóstico grave, cambio de repuestos o dictamen de baja. Solo aplican a órdenes abiertas.
          </span>
        </div>

        {/* Orden y Técnico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="informe-orden"
              label="Orden de Servicio Activa"
              options={ordenOptions}
              error={errors.orden_id?.message}
              {...register('orden_id', { valueAsNumber: true })}
              disabled={Boolean(defaultOrden)}
            />
          </div>

          <div>
            <Select
              id="informe-tecnico"
              label="Técnico Evaluador Autor"
              options={tecnicoOptions}
              error={errors.user_id?.message}
              {...register('user_id', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Tipo de Informe y Título */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              id="informe-tipo"
              label="Clasificación del Informe"
              options={tipoInformeOptions}
              error={errors.tipo_informe?.message}
              {...register('tipo_informe')}
            />
          </div>

          <div>
            <Input
              id="informe-titulo"
              label="Título del Documento"
              error={errors.titulo?.message}
              {...register('titulo')}
            />
          </div>
        </div>

        {/* ══════════ SECCIÓN: FOTOGRAFÍA DEL ACTIVO TI ══════════ */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Fotografía y Evidencia del Equipo TI</span>
            </div>

            {/* Píldoras de selección de modo */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
              {existingEquipoImg && (
                <button
                  type="button"
                  onClick={() => setPhotoOption('equipo')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photoOption === 'equipo'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Laptop className="w-3 h-3" />
                  <span>Foto del Equipo</span>
                  {photoOption === 'equipo' && <Check className="w-2.5 h-2.5 ml-0.5" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setPhotoOption('nueva');
                  if (!newPhotoPreview) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  photoOption === 'nueva'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <UploadCloud className="w-3 h-3" />
                <span>{newPhotoPreview ? 'Nueva Foto Cargada' : 'Subir Nueva Foto'}</span>
                {photoOption === 'nueva' && <Check className="w-2.5 h-2.5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => setPhotoOption('ninguna')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  photoOption === 'ninguna'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <span>Sin Foto</span>
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
          />

          {/* Vista previa según opción activa */}
          {photoOption === 'equipo' && existingEquipoImg && (
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="w-24 h-20 rounded-md overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
                <img
                  src={existingEquipoImg}
                  alt="Foto de inventario"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                  Foto registrada en el Inventario de Equipos
                </span>
                <span className="text-[11px] block mt-0.5 text-slate-500">
                  Activo: <strong className="text-slate-700 dark:text-slate-300">{currentOrden?.equipo?.numero_etiqueta}</strong> —{' '}
                  {currentOrden?.equipo?.marca?.nombre} {currentOrden?.equipo?.modelo?.nombre}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Esta imagen se incluirá prominentemente en el informe impreso y PDF.
                </span>
              </div>
            </div>
          )}

          {photoOption === 'nueva' && (
            <div>
              {newPhotoPreview ? (
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="w-24 h-20 rounded-md overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
                    <img
                      src={newPhotoPreview}
                      alt="Nueva foto cargada"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                      Nueva fotografía seleccionada para este informe
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Esta foto se asociará al informe y actualizará la ficha del equipo en inventario.
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] py-0.5 px-2"
                      >
                        Cambiar Foto
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleRemoveNewPhoto}
                        className="text-[10px] py-0.5 px-2"
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center px-4"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Subir nueva foto del equipo o evidencia técnica
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Haga clic aquí para seleccionar imagen (JPG, PNG, WebP • Máx 2MB)
                  </span>
                </div>
              )}
            </div>
          )}

          {photoOption === 'ninguna' && (
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-[11px]">
              El informe se emitirá sin imagen adjunta del equipo.
            </div>
          )}
        </div>

        {/* Diagnóstico Final */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Diagnóstico Técnico y Evaluación de Daños
          </label>
          <textarea
            {...register('diagnostico_final')}
            rows={3}
            className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none"
          />
          {errors.diagnostico_final && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.diagnostico_final.message}
            </span>
          )}
        </div>

        {/* Solución y Repuestos Requeridos */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Solución Técnica / Repuestos y Cambio de Piezas Requeridos
          </label>
          <textarea
            {...register('solucion_aplicada')}
            rows={3}
            className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none"
          />
          {errors.solucion_aplicada && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.solucion_aplicada.message}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleModalClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting || createMutation.isPending}
            leftIcon={<FilePlus className="w-4 h-4" />}
          >
            Emitir Informe Técnico
          </Button>
        </div>
      </form>
    </Modal>
  );
}
