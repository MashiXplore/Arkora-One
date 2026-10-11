// src/frontend/components/modules/equipos/EquipoCreateModal.tsx
// Modal de creación de equipos TI en 3 columnas optimizadas: Imagen+Código | Datos | Observaciones en Lista
// Skill: react-modernization

'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEquipoSchema, type CreateEquipoInput } from '@/backend/validators/equipo.validator';
import { useCreateEquipo, useMarcas, useTiposEquipo, useModelos } from '@/frontend/hooks/useEquipos';
import { useFuncionarios } from '@/frontend/hooks/useFuncionarios';
import { Modal, Input, Select, Button, showToast } from '@/frontend/components/ui';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export interface EquipoCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EquipoCreateModal({ isOpen, onClose }: EquipoCreateModalProps) {
  const [selectedMarca, setSelectedMarca] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Lista dinámica de observaciones / accesorios
  const [observacionesList, setObservacionesList] = useState<string[]>([]);
  const [newObsInput, setNewObsInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateEquipo();

  const { data: marcasData } = useMarcas();
  const { data: tiposData } = useTiposEquipo(selectedMarca ? Number(selectedMarca) : undefined);
  const { data: modelosData } = useModelos({
    marcaId: selectedMarca ? Number(selectedMarca) : undefined,
    tipoEquipoId: selectedTipo ? Number(selectedTipo) : undefined,
  });
  const { data: funcionariosData } = useFuncionarios({ pageSize: 100 });

  const marcas =
    marcasData && 'success' in marcasData && marcasData.success && Array.isArray(marcasData.data)
      ? marcasData.data
      : [];

  const tipos =
    tiposData && 'success' in tiposData && tiposData.success && Array.isArray(tiposData.data)
      ? tiposData.data
      : [];

  const modelos =
    modelosData && 'success' in modelosData && modelosData.success && Array.isArray(modelosData.data)
      ? modelosData.data
      : [];

  const funcionarios =
    funcionariosData && 'data' in funcionariosData && Array.isArray(funcionariosData.data)
      ? funcionariosData.data
      : [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEquipoInput>({
    resolver: zodResolver(createEquipoSchema),
    defaultValues: {
      estado_operativo: 'operativo',
      observaciones: '',
      imagen: '',
    },
  });

  // Manejo de carga de imagen local a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast.error('La imagen no debe superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setValue('imagen', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('imagen', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manejo de la lista dinámica de observaciones
  const handleAddObservacion = (textToAdd?: string) => {
    const val = (textToAdd ?? newObsInput).trim();
    if (!val) return;
    if (observacionesList.includes(val)) {
      showToast.error('Esta observación ya fue agregada');
      return;
    }
    const updated = [...observacionesList, val];
    setObservacionesList(updated);
    setValue('observaciones', updated.join('\n'));
    if (!textToAdd) setNewObsInput('');
  };

  const handleRemoveObservacion = (index: number) => {
    const updated = observacionesList.filter((_, i) => i !== index);
    setObservacionesList(updated);
    setValue('observaciones', updated.join('\n'));
  };

  const onSubmit = async (data: CreateEquipoInput) => {
    try {
      // Sincronizar observaciones de la lista antes de enviar
      if (observacionesList.length > 0) {
        data.observaciones = observacionesList.join('\n');
      }
      const result = await createMutation.mutateAsync(data);
      if (result.success) {
        showToast.success('Equipo registrado exitosamente');
        handleClose();
      } else {
        showToast.error(result.error?.message ?? 'Error al registrar el equipo');
      }
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Error al guardar el equipo');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedMarca('');
    setSelectedTipo('');
    setImagePreview(null);
    setObservacionesList([]);
    setNewObsInput('');
    onClose();
  };

  // Sugerencias rápidas de accesorios frecuentes
  const quickSuggestions = [
    'Asignado con cargador',
    'Con teclado USB',
    'Con mouse óptico',
    'Con maletín institucional',
    'Cable de poder original',
    'Pantalla con protector',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Nuevo Equipo"
      size="3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {/* Contenedor de 3 Columnas Optimizadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start">
          
          {/* ══════════ COLUMNA 1: IMAGEN Y CÓDIGOS ══════════ */}
          <div className="space-y-2.5 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Foto e Identificación
            </span>

            {/* Recuadro de Imagen del Equipo */}
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="file-input-equipo"
              />

              {imagePreview ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Vista previa equipo"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded bg-white text-slate-900 text-[11px] font-semibold hover:bg-slate-100 shadow"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 shadow"
                      title="Eliminar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors p-2 text-center"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Cargar foto del equipo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    PNG, JPG o WebP (Máx. 2MB)
                  </span>
                </div>
              )}
            </div>

            {/* Código de Activo / Etiqueta */}
            <div>
              <Input
                id="create-eq-etiqueta"
                label="Código de Activo / Etiqueta *"
                placeholder="Ej. 05-09201"
                error={errors.numero_etiqueta?.message}
                {...register('numero_etiqueta')}
              />
            </div>

            {/* Número de Serie */}
            <div>
              <Input
                id="create-eq-serie"
                label="Número de Serie (S/N)"
                placeholder="Ej. DL5420-99881A"
                error={errors.numero_serie?.message}
                {...register('numero_serie')}
              />
            </div>
          </div>

          {/* ══════════ COLUMNA 2: MARCA, TIPO, MODELO Y ESTADO ══════════ */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Especificaciones y Custodia
            </span>

            {/* Marca */}
            <div>
              <label htmlFor="create-eq-marca" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Marca *
              </label>
              <Select
                id="create-eq-marca"
                error={errors.marca_id?.message}
                options={[
                  { value: '', label: 'Seleccionar marca...' },
                  ...marcas.map((m) => ({ value: String(m.id), label: m.nombre })),
                ]}
                {...register('marca_id', {
                  onChange: (e) => {
                    setSelectedMarca(e.target.value);
                    setSelectedTipo('');
                    setValue('tipo_equipo_id', 0 as unknown as number);
                    setValue('modelo_id', 0 as unknown as number);
                  },
                })}
              />
            </div>

            {/* Tipo de Equipo */}
            <div>
              <label htmlFor="create-eq-tipo" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Tipo de Equipo *
              </label>
              <Select
                id="create-eq-tipo"
                error={errors.tipo_equipo_id?.message}
                options={[
                  { value: '', label: 'Seleccionar tipo...' },
                  ...tipos.map((t) => ({ value: String(t.id), label: t.nombre })),
                ]}
                {...register('tipo_equipo_id', {
                  onChange: (e) => {
                    setSelectedTipo(e.target.value);
                    setValue('modelo_id', 0 as unknown as number);
                  },
                })}
              />
            </div>

            {/* Modelo */}
            <div>
              <label htmlFor="create-eq-modelo" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Modelo *
              </label>
              <Select
                id="create-eq-modelo"
                error={errors.modelo_id?.message}
                options={[
                  { value: '', label: 'Seleccionar modelo...' },
                  ...modelos.map((mod) => ({ value: String(mod.id), label: mod.nombre })),
                ]}
                {...register('modelo_id')}
              />
            </div>

            {/* Custodio / Asignado */}
            <div>
              <label htmlFor="create-eq-func" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Custodio / Asignado
              </label>
              <Select
                id="create-eq-func"
                options={[
                  { value: '', label: 'Sin asignar (Almacén)' },
                  ...funcionarios.map((f) => ({ value: String(f.id), label: `${f.nombre} (${f.agencia?.nombre || 'General'})` })),
                ]}
                {...register('funcionario_id', {
                  setValueAs: (v) => (v === '' ? null : Number(v)),
                })}
              />
            </div>

            {/* Estado Operativo y Fecha de Ingreso juntos */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <label htmlFor="create-eq-estado" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Estado
                </label>
                <Select
                  id="create-eq-estado"
                  options={[
                    { value: 'operativo', label: 'Operativo' },
                    { value: 'en_mantenimiento', label: 'En Mant.' },
                    { value: 'de_baja', label: 'De Baja' },
                    { value: 'en_desuso', label: 'Desuso' },
                  ]}
                  {...register('estado_operativo')}
                />
              </div>

              <div>
                <Input
                  id="create-eq-fecha"
                  label="Fecha Ingreso"
                  type="date"
                  {...register('fecha_ingreso')}
                />
              </div>
            </div>
          </div>

          {/* ══════════ COLUMNA 3: OBSERVACIONES EN LISTA / TABLA ══════════ */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Observaciones & Accesorios
            </span>

            {/* Input para agregar nueva observación */}
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Ej. Asignado con cargador..."
                value={newObsInput}
                onChange={(e) => setNewObsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObservacion();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleAddObservacion()}
                className="px-2.5 py-1 text-xs shrink-0"
                title="Agregar observación a la lista"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Chips sugeridos de un clic */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Sugerencias rápidas:
              </span>
              <div className="flex flex-wrap gap-1">
                {quickSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAddObservacion(sug)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla / Lista de observaciones agregadas */}
            <div className="flex-1 mt-1 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-white dark:bg-slate-900 overflow-hidden flex flex-col min-h-[150px]">
              <div className="px-2.5 py-1.5 bg-slate-100/70 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span>Lista de Observaciones</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                  {observacionesList.length}
                </span>
              </div>

              <div className="p-1.5 overflow-y-auto max-h-48 flex-1 space-y-1">
                {observacionesList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                    <Tag className="w-5 h-5 mb-1 text-slate-300 dark:text-slate-600" />
                    <span>Sin observaciones registradas</span>
                    <span className="text-[10px] text-slate-400/80 mt-0.5">
                      Escribe o presiona una sugerencia arriba
                    </span>
                  </div>
                ) : (
                  observacionesList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveObservacion(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors shrink-0"
                        title="Quitar de la lista"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción compactos */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting || createMutation.isPending}>
            Guardar Equipo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
