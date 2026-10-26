// src/frontend/components/modules/asignaciones/AsignacionModal.tsx
// Modal para Asignar, Reasignar o Devolver equipos a Almacén con layout exacto de 3 columnas:
// Col 1 (Izquierda): Datos Básicos del Equipo (Foto, código, serie, custodio previo)
// Col 2 (Medio): Introducir Datos (Select equipo, select nuevo custodio, fecha, motivo, observaciones)
// Col 3 (Derecha): Datos Básicos de la Persona Asignada (Avatar, cargo, sucursal, agencia, contacto)
// Skill: react-modernization

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal, Select, Input, Button, showToast } from '@/frontend/components/ui';
import { useEquipos, useUpdateEquipo } from '@/frontend/hooks/useEquipos';
import { useFuncionarios } from '@/frontend/hooks/useFuncionarios';
import {
  Laptop,
  User,
  Building2,
  Calendar,
  FileText,
  ArrowRightLeft,
  Warehouse,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Phone,
  Mail,
  ShieldCheck,
  Tag,
  Monitor,
  Printer,
  Smartphone,
  HardDrive,
  Cpu,
  Layers,
  MapPin,
  Briefcase,
} from 'lucide-react';
import type { EquipoWithRelations } from '@/types/equipo.types';
import type { FuncionarioWithRelations } from '@/types/funcionario.types';
import type { AsignacionMovimiento } from './AsignacionHistoryModal';

export interface AsignacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEquipo?: EquipoWithRelations | null;
}

export function AsignacionModal({
  isOpen,
  onClose,
  defaultEquipo,
}: AsignacionModalProps) {
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>('');
  const [tipoAccion, setTipoAccion] = useState<'asignar' | 'devolver'>('asignar');
  const [funcionarioId, setFuncionarioId] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState<string>('Dotación de nuevo funcionario');
  const [observaciones, setObservaciones] = useState<string>('');

  const { data: equiposData } = useEquipos({ pageSize: 250 });
  const { data: funcionariosData } = useFuncionarios({ pageSize: 250 });
  const updateMutation = useUpdateEquipo();

  const equipos =
    equiposData && 'data' in equiposData && Array.isArray(equiposData.data)
      ? (equiposData.data as EquipoWithRelations[])
      : [];

  const funcionarios =
    funcionariosData && 'data' in funcionariosData && Array.isArray(funcionariosData.data)
      ? (funcionariosData.data as FuncionarioWithRelations[])
      : [];

  // Reset y sincronización al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (defaultEquipo) {
        setSelectedEquipoId(String(defaultEquipo.id));
        setTipoAccion('asignar');
        setFuncionarioId('');
      } else {
        setSelectedEquipoId('');
        setFuncionarioId('');
        setTipoAccion('asignar');
      }
      setFecha(new Date().toISOString().split('T')[0]);
      setMotivo('Dotación de nuevo funcionario');
      setObservaciones('');
    }
  }, [isOpen, defaultEquipo]);

  const activeEquipo =
    equipos.find((e) => String(e.id) === selectedEquipoId) || defaultEquipo || null;

  const selectedFuncionario = funcionarios.find((f) => String(f.id) === funcionarioId);

  // Opciones de equipos optimizadas con badge de código de activo y custodio
  const equipoOptions = useMemo(() => {
    return equipos.map((eq) => ({
      value: String(eq.id),
      badge: eq.numero_etiqueta,
      label: `${eq.tipo_equipo?.nombre || 'Equipo'} · ${eq.marca?.nombre || ''} ${
        eq.modelo?.nombre || ''
      }`.trim(),
      sublabel: eq.funcionario
        ? `Custodio actual: ${eq.funcionario.nombre} (${
            eq.funcionario.agencia?.nombre || 'Agencia'
          })`
        : 'Disponible en Almacén / Stock TI Central',
    }));
  }, [equipos]);

  // Opciones de funcionarios con cargo y agencia
  const funcionarioOptions = useMemo(() => {
    return funcionarios
      .filter((f) => f.estado)
      .map((f) => {
        const cargoText = f.cargo?.nombre || f.departamento_area || 'Personal';
        const agenciaText = f.agencia?.nombre || 'Agencia Central';
        const sucursalText = f.agencia?.sucursal?.nombre ? ` (${f.agencia.sucursal.nombre})` : '';

        return {
          value: String(f.id),
          label: f.nombre,
          sublabel: `${cargoText} · ${agenciaText}${sucursalText}`,
        };
      });
  }, [funcionarios]);

  const motivosPredefinidos = [
    'Dotación de nuevo funcionario',
    'Asignación para labores operativas institucionales',
    'Reasignación por cambio de puesto o agencia',
    'Sustitución temporal por mantenimiento técnico',
    'Asignación inicial (Equipo nuevo)',
    'Devolución por cese o renuncia de funciones',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEquipo) {
      showToast.error('Por favor, selecciona un equipo en la columna central');
      return;
    }

    if (tipoAccion === 'asignar' && !funcionarioId) {
      showToast.error('Por favor, selecciona al nuevo funcionario custodio');
      return;
    }

    try {
      let currentHistorial: AsignacionMovimiento[] = [];
      let parsedSpecs: Record<string, unknown> = {};

      if (activeEquipo.especificaciones) {
        try {
          parsedSpecs =
            typeof activeEquipo.especificaciones === 'string'
              ? JSON.parse(activeEquipo.especificaciones)
              : activeEquipo.especificaciones;

          if (parsedSpecs && Array.isArray(parsedSpecs.historial_asignaciones)) {
            currentHistorial = parsedSpecs.historial_asignaciones as AsignacionMovimiento[];
          }
        } catch {
          currentHistorial = [];
        }
      }

      const isReasignacion = Boolean(activeEquipo.funcionario_id && tipoAccion === 'asignar');
      const isDevolucion = tipoAccion === 'devolver';

      const nuevoMovimiento: AsignacionMovimiento = {
        id: `asig-${Date.now()}`,
        fecha,
        tipo: isDevolucion
          ? 'devolucion_almacen'
          : isReasignacion
          ? 'reasignacion'
          : 'asignacion',
        funcionario_nombre: isDevolucion
          ? undefined
          : selectedFuncionario?.nombre || 'Funcionario Asignado',
        cargo_nombre: isDevolucion
          ? undefined
          : selectedFuncionario?.cargo?.nombre || selectedFuncionario?.departamento_area || undefined,
        agencia_nombre: isDevolucion
          ? undefined
          : selectedFuncionario?.agencia?.nombre || undefined,
        motivo: isDevolucion ? 'Devolución de equipo a Almacén / Stock TI' : motivo,
        observaciones: observaciones || undefined,
      };

      const updatedHistorial = [...currentHistorial, nuevoMovimiento];
      const updatedSpecs = {
        ...parsedSpecs,
        historial_asignaciones: updatedHistorial,
        ultimo_movimiento: nuevoMovimiento,
      };

      const res = await updateMutation.mutateAsync({
        id: activeEquipo.id,
        data: {
          funcionario_id: isDevolucion ? null : Number(funcionarioId),
          especificaciones: updatedSpecs,
        },
      });

      if (res.success) {
        showToast.success(
          isDevolucion
            ? 'Equipo devuelto a almacén TI exitosamente'
            : isReasignacion
            ? 'Equipo reasignado exitosamente'
            : 'Equipo asignado correctamente'
        );
        onClose();
      } else {
        showToast.error(res.error?.message ?? 'Error al procesar el movimiento');
      }
    } catch {
      showToast.error('Error de comunicación con el servidor');
    }
  };

  // Helper para renderizar icono representativo si no hay foto cargada
  const renderEquipmentIcon = (tipoNombre?: string) => {
    const t = (tipoNombre || '').toLowerCase();
    if (t.includes('monitor') || t.includes('pantalla')) {
      return <Monitor className="w-10 h-10 text-blue-500" />;
    }
    if (t.includes('impresora') || t.includes('printer')) {
      return <Printer className="w-10 h-10 text-indigo-500" />;
    }
    if (t.includes('celular') || t.includes('movil') || t.includes('telefono')) {
      return <Smartphone className="w-10 h-10 text-emerald-500" />;
    }
    if (t.includes('servidor') || t.includes('server')) {
      return <HardDrive className="w-10 h-10 text-purple-500" />;
    }
    return <Laptop className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeEquipo?.funcionario_id
          ? `Reasignar / Mover Custodia: ${activeEquipo.numero_etiqueta}`
          : 'Asignación de Equipo Institucional'
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5 text-xs">
        {/* Contenedor de 3 Columnas: Izquierda (Equipo) | Medio (Formulario de Datos) | Derecha (Nueva Persona) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* COLUMNA 1 (IZQUIERDA): DATOS BÁSICOS DEL EQUIPO (ORIGEN)            */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Datos Básicos del Equipo</span>
              </div>

              {activeEquipo ? (
                <div className="space-y-2.5">
                  {/* Foto o Icono representativo del equipo */}
                  <div className="w-full h-28 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-center overflow-hidden">
                    {activeEquipo.imagen ? (
                      <img
                        src={activeEquipo.imagen}
                        alt={activeEquipo.numero_etiqueta}
                        className="w-full h-full object-contain p-1.5"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                        {renderEquipmentIcon(activeEquipo.tipo_equipo?.nombre)}
                        <span className="text-[10px] text-slate-400">Sin foto cargada</span>
                      </div>
                    )}
                  </div>

                  {/* Código de Activo y Estado */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100/90 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                      {activeEquipo.numero_etiqueta}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {activeEquipo.estado_operativo}
                    </span>
                  </div>

                  {/* Ficha Técnica: Modelo, Marca, Tipo y Serie */}
                  <div className="space-y-1 bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px]">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Tipo:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {activeEquipo.tipo_equipo?.nombre || 'General'}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Marca:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {activeEquipo.marca?.nombre || 'S/M'}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Modelo:</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                        {activeEquipo.modelo?.nombre || 'S/M'}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                      <span>Serie (S/N):</span>
                      <strong className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                        {activeEquipo.numero_serie || 'Sin registro'}
                      </strong>
                    </div>
                  </div>

                  {/* Custodio Actual (A quién pertenecía) */}
                  {activeEquipo.funcionario ? (
                    <div className="p-2.5 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-xl space-y-1 text-amber-900 dark:text-amber-200">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-amber-700 dark:text-amber-400 pb-0.5 border-b border-amber-200/60 dark:border-amber-900/40">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-600" />
                          Custodio Actual (Origen)
                        </span>
                        <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                      </div>
                      <p className="text-xs font-bold text-amber-950 dark:text-amber-100 truncate">
                        {activeEquipo.funcionario.nombre}
                      </p>
                      <p className="text-[10px] text-amber-800/90 dark:text-amber-300 truncate">
                        {activeEquipo.funcionario.cargo?.nombre ||
                          activeEquipo.funcionario.departamento_area ||
                          'Personal Asignado'}
                      </p>
                      <p className="text-[9px] text-amber-700 dark:text-amber-400 truncate">
                        {activeEquipo.funcionario.agencia?.nombre || 'Agencia'}
                        {activeEquipo.funcionario.agencia?.sucursal?.nombre
                          ? ` (${activeEquipo.funcionario.agencia.sucursal.nombre})`
                          : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-900/50 rounded-xl space-y-0.5 text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <Warehouse className="w-3 h-3 text-emerald-600" />
                        <span>En Almacén / Stock Central TI</span>
                      </div>
                      <p className="text-[10px] text-emerald-800 dark:text-emerald-300">
                        Equipo libre disponible para su asignación.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 my-auto">
                  <Laptop className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Sin equipo seleccionado
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Elige un equipo en la columna central para cargar su información.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* COLUMNA 2 (MEDIO): INTRODUCIR DATOS (FORMULARIO PRINCIPAL)          */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Introducir Datos del Movimiento</span>
            </div>

            {/* Pestañas de Tipo de Acción (Reasignar o Devolver) */}
            {activeEquipo?.funcionario_id && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTipoAccion('asignar')}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-all flex items-center justify-center gap-1 text-[11px] ${
                    tipoAccion === 'asignar'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  Reasignar
                </button>
                <button
                  type="button"
                  onClick={() => setTipoAccion('devolver')}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-all flex items-center justify-center gap-1 text-[11px] ${
                    tipoAccion === 'devolver'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Warehouse className="w-3 h-3" />
                  Devolver a Stock
                </button>
              </div>
            )}

            {/* Selector de Equipo */}
            <div>
              <Select
                id="asignacion-equipo-input"
                label="Seleccionar Equipo *"
                options={equipoOptions}
                value={selectedEquipoId}
                onChange={(e) => setSelectedEquipoId(e.target.value)}
                placeholder="Buscar por código de activo, serie o modelo..."
                disabled={Boolean(defaultEquipo)}
              />
            </div>

            {/* Selector de Funcionario si la acción es Asignar / Reasignar */}
            {tipoAccion === 'asignar' ? (
              <div>
                <Select
                  id="asignacion-funcionario-input"
                  label="Nuevo Propietario / Custodio *"
                  options={funcionarioOptions}
                  value={funcionarioId}
                  onChange={(e) => setFuncionarioId(e.target.value)}
                  placeholder="Buscar funcionario por nombre, cargo o agencia..."
                />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">
                El equipo será devuelto a almacén general y quedará desvinculado de custodio.
              </div>
            )}

            {/* Fecha y Motivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Input
                  id="asignacion-fecha-input"
                  type="date"
                  label="Fecha del Movimiento *"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Motivo *
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full h-8 text-xs px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                >
                  {motivosPredefinidos.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Observaciones / Condiciones de Entrega
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                placeholder="Detallar accesorios (mouse, cargador, maletín), estado físico del equipo..."
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none"
              />
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* COLUMNA 3 (DERECHA): DATOS BÁSICOS DE LA PERSONA ASIGNADA (DESTINO)  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Datos Básicos de la Persona Asignada</span>
              </div>

              {tipoAccion === 'asignar' ? (
                selectedFuncionario ? (
                  <div className="space-y-2.5">
                    {/* Tarjeta de Identidad del Nuevo Propietario */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200/80 dark:border-blue-900/60 shadow-2xs space-y-2">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar con Iniciales */}
                        <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                          {selectedFuncionario.nombre
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {selectedFuncionario.nombre}
                            </p>
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 shrink-0">
                              Nuevo Custodio
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                            {selectedFuncionario.cargo?.nombre ||
                              selectedFuncionario.departamento_area ||
                              'Personal Institucional'}
                          </p>
                        </div>
                      </div>

                      {/* Detalles Organizacionales en Bloques Compactos */}
                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            Cargo:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                            {selectedFuncionario.cargo?.nombre ||
                              selectedFuncionario.departamento_area ||
                              'Asignado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            Sucursal:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                            {selectedFuncionario.agencia?.sucursal?.nombre || 'Principal'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            Agencia:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                            {selectedFuncionario.agencia?.nombre || 'Central'}
                          </span>
                        </div>
                      </div>

                      {/* Contacto directo */}
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {selectedFuncionario.telefono && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{selectedFuncionario.telefono}</span>
                          </div>
                        )}
                        {selectedFuncionario.correo && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{selectedFuncionario.correo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed border-blue-200/80 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/10 text-slate-400 my-auto">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 text-blue-500 opacity-60" />
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Sin nuevo propietario
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Selecciona un funcionario en el buscador central para ver sus datos.
                    </p>
                  </div>
                )
              ) : (
                /* Destino Almacén TI */
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-2xs space-y-2 text-center my-auto">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Destino: Almacén / Stock Central TI
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    El equipo quedará registrado como disponible en bodega central TI, liberando la custodia personal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* FOOTER: BOTONES DE ACCIÓN                                            */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={updateMutation.isPending}
          >
            {tipoAccion === 'devolver'
              ? 'Confirmar Devolución a Stock'
              : activeEquipo?.funcionario_id
              ? 'Confirmar Reasignación'
              : 'Asignar Equipo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
