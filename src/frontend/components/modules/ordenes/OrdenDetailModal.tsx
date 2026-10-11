// src/frontend/components/modules/ordenes/OrdenDetailModal.tsx
// Modal de detalle completo para una Orden de Servicio
// Skill: react-modernization

'use client';

import { Modal, Badge, Button } from '@/frontend/components/ui';
import {
  Laptop,
  User,
  Calendar,
  Clock,
  Wrench,
  FileCheck2,
  FilePlus,
  Shield,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import type { OrdenWithRelations, EstadoOrden, Prioridad, TipoServicio } from '@/types/orden.types';

export interface OrdenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenWithRelations | null;
  onCreateInforme: (orden: OrdenWithRelations) => void;
  onViewInforme: (informeId: number) => void;
}

export function OrdenDetailModal({
  isOpen,
  onClose,
  orden,
  onCreateInforme,
  onViewInforme,
}: OrdenDetailModalProps) {
  if (!orden) return null;

  const getEstadoBadge = (estado: EstadoOrden) => {
    switch (estado) {
      case 'creado':
        return <Badge variant="info">Creado</Badge>;
      case 'en_proceso':
        return <Badge variant="warning">En Proceso</Badge>;
      case 'finalizado':
        return <Badge variant="success">Finalizado</Badge>;
      case 'entregado':
        return <Badge variant="success">Entregado</Badge>;
      case 'cancelado':
        return <Badge variant="danger">Cancelado</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  const getPrioridadBadge = (prio: Prioridad) => {
    switch (prio) {
      case 'urgente':
        return <Badge variant="danger">Urgente</Badge>;
      case 'alta':
        return <Badge variant="warning">Alta</Badge>;
      case 'media':
        return <Badge variant="info">Media</Badge>;
      case 'baja':
        return <Badge variant="neutral">Baja</Badge>;
    }
  };

  const formatServicio = (tipo: TipoServicio) => {
    switch (tipo) {
      case 'mantenimiento_preventivo':
        return 'Mantenimiento Preventivo';
      case 'mantenimiento_correctivo':
        return 'Mantenimiento Correctivo';
      case 'reparacion':
        return 'Reparación / Corrección de Falla';
      case 'diagnostico':
        return 'Diagnóstico Técnico';
      case 'instalacion':
        return 'Instalación y Configuración';
    }
  };

  const formatDate = (dateVal: string | Date | null) => {
    if (!dateVal) return 'No especificada';
    return new Date(dateVal).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Orden de Servicio: ${orden.numero_orden}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Cabecera de Estado y Prioridad */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Estado:</span>
            {getEstadoBadge(orden.estado)}
            <span className="font-semibold text-slate-500 ml-2">Prioridad:</span>
            {getPrioridadBadge(orden.prioridad)}
          </div>
          <div className="text-slate-600 dark:text-slate-300 font-medium">
            <span className="text-slate-400">Servicio:</span> {formatServicio(orden.tipo_servicio)}
          </div>
        </div>

        {/* Sección: Datos del Equipo y del Solicitante */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card Equipo */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <Laptop className="w-4 h-4 text-blue-500" />
              <span>Equipo Informático</span>
            </div>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">Etiqueta / Código Activo:</span>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                  {orden.equipo.numero_etiqueta}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">Tipo y Modelo:</span>
                <span>
                  {orden.equipo.tipo_equipo?.nombre} · {orden.equipo.marca?.nombre} {orden.equipo.modelo?.nombre}
                </span>
              </div>
              {orden.equipo.numero_serie && (
                <div>
                  <span className="text-slate-400 block font-medium text-[11px]">Número de Serie:</span>
                  <span className="font-mono">{orden.equipo.numero_serie}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Funcionario */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Funcionario Solicitante</span>
            </div>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">Nombre Completo:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {orden.funcionario.nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">Cargo y Departamento:</span>
                <span>
                  {orden.funcionario.cargo?.nombre || 'Funcionario'} · {orden.funcionario.departamento_area || 'Área'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">Ubicación Institucional:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {orden.funcionario.agencia?.nombre || 'Agencia'}
                  {orden.funcionario.agencia?.sucursal && ` (${orden.funcionario.agencia.sucursal.nombre})`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Atención Técnica */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Atención Técnica y Diagnóstico</span>
            </div>
            <div className="text-slate-500">
              Entrega Estimada: <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(orden.fecha_estimada_entrega)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Recepcionado por:</span>
              <span>{orden.recepcionista?.name} ({orden.recepcionista?.email})</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Técnico Asignado:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {orden.tecnico ? orden.tecnico.name : 'Sin asignar'}
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-medium text-[11px] mb-1">
              Diagnóstico Inicial Reportado:
            </span>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
              {orden.diagnostico_inicial || 'Sin diagnóstico inicial registrado.'}
            </div>
          </div>
        </div>

        {/* Sección: Informe Técnico Asociado */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              <span>Informe Técnico Asociado</span>
            </div>
            {orden.informe ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onViewInforme(orden.informe!.id);
                }}
              >
                Ver Informe Técnico
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FilePlus className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onCreateInforme(orden);
                }}
              >
                Emitir Informe Técnico
              </Button>
            )}
          </div>

          {orden.informe ? (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-slate-800 dark:text-slate-100">
                {orden.informe.titulo}
              </div>
              <div className="text-[11px] text-slate-400">
                Tipo: {orden.informe.tipo_informe} · Fecha: {formatDate(orden.informe.fecha)}
              </div>
              {orden.informe.solucion_aplicada && (
                <div className="text-slate-700 dark:text-slate-200 mt-1 line-clamp-2">
                  <span className="font-medium text-slate-400">Solución: </span>
                  {orden.informe.solucion_aplicada}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-slate-400 italic">
              Esta orden aún no cuenta con un informe técnico de cierre o diagnóstico final.
            </p>
          )}
        </div>

        {/* Botón Cerrar */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
