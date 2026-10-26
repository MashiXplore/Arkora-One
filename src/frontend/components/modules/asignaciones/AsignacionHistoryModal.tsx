// src/frontend/components/modules/asignaciones/AsignacionHistoryModal.tsx
// Modal de Trazabilidad y Seguimiento Histórico de Custodia de Equipos TI
// Permite auditar dónde ha estado el equipo, a qué agencias fue asignado y reasignaciones

'use client';

import { Modal, Badge, Button } from '@/frontend/components/ui';
import {
  History,
  Laptop,
  User,
  Building2,
  Calendar,
  ArrowRightLeft,
  CheckCircle2,
  Package,
  RotateCcw,
} from 'lucide-react';
import type { EquipoWithRelations } from '@/types/equipo.types';

export interface AsignacionMovimiento {
  id: string;
  fecha: string;
  tipo: 'ingreso_nuevo' | 'asignacion' | 'reasignacion' | 'devolucion_almacen';
  funcionario_nombre?: string;
  cargo_nombre?: string;
  agencia_nombre?: string;
  motivo: string;
  observaciones?: string;
}

export interface AsignacionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: EquipoWithRelations | null;
}

export function AsignacionHistoryModal({
  isOpen,
  onClose,
  equipo,
}: AsignacionHistoryModalProps) {
  if (!equipo) return null;

  // Extraer historial guardado en especificaciones o generar historial cronológico inicial
  let historial: AsignacionMovimiento[] = [];
  try {
    if (equipo.especificaciones) {
      const parsed =
        typeof equipo.especificaciones === 'string'
          ? JSON.parse(equipo.especificaciones)
          : equipo.especificaciones;

      if (parsed && Array.isArray(parsed.historial_asignaciones)) {
        historial = parsed.historial_asignaciones;
      }
    }
  } catch {
    historial = [];
  }

  // Si no hay historial previo pero el equipo tiene asignación actual o fecha de ingreso, armar registro base
  if (historial.length === 0) {
    if (equipo.fecha_ingreso) {
      historial.push({
        id: 'hist-1',
        fecha: new Date(equipo.fecha_ingreso).toISOString().split('T')[0],
        tipo: 'ingreso_nuevo',
        motivo: 'Ingreso inicial de equipo nuevo al inventario institucional',
        observaciones: equipo.observaciones || 'Activo verificado y registrado en el sistema',
      });
    }

    if (equipo.funcionario) {
      historial.push({
        id: 'hist-2',
        fecha: new Date(equipo.createdAt).toISOString().split('T')[0],
        tipo: 'asignacion',
        funcionario_nombre: equipo.funcionario.nombre,
        cargo_nombre: equipo.funcionario.departamento_area || 'Área Operativa',
        agencia_nombre: equipo.funcionario.agencia?.nombre || 'Agencia Asignada',
        motivo: 'Asignación de equipo para labores institucionales',
        observaciones: 'Custodio registrado actualmente',
      });
    }
  }

  // Ordenar de más reciente a más antiguo
  const sortedHistorial = [...historial].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const getTipoBadge = (tipo: AsignacionMovimiento['tipo']) => {
    switch (tipo) {
      case 'ingreso_nuevo':
        return <Badge variant="info">Ingreso Nuevo</Badge>;
      case 'asignacion':
        return <Badge variant="success">Asignación Inicial</Badge>;
      case 'reasignacion':
        return <Badge variant="warning">Reasignación</Badge>;
      case 'devolucion_almacen':
        return <Badge variant="neutral">Devolución a Stock</Badge>;
    }
  };

  const getTipoIcon = (tipo: AsignacionMovimiento['tipo']) => {
    switch (tipo) {
      case 'ingreso_nuevo':
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
      case 'asignacion':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'reasignacion':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />;
      case 'devolucion_almacen':
        return <RotateCcw className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trazabilidad de Custodia: ${equipo.numero_etiqueta}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Cabecera del Equipo */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-100 font-mono text-sm block">
                {equipo.numero_etiqueta}
              </span>
              <span className="text-[11px] text-slate-500">
                {equipo.tipo_equipo?.nombre} · {equipo.marca?.nombre} {equipo.modelo?.nombre}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[11px] block">Custodio Actual:</span>
            {equipo.funcionario ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {equipo.funcionario.nombre} ({equipo.funcionario.agencia?.nombre})
              </span>
            ) : (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                En Almacén TI / Disponible
              </span>
            )}
          </div>
        </div>

        {/* Línea de tiempo de movimientos */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-800">
            <History className="w-3.5 h-3.5 text-blue-500" />
            <span>Historial Cronológico de Movimientos y Reasignaciones</span>
          </div>

          {sortedHistorial.length === 0 ? (
            <p className="text-slate-400 italic text-center py-6">
              No existen movimientos registrados para este activo.
            </p>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 space-y-4 py-2">
              {sortedHistorial.map((mov, idx) => (
                <div key={mov.id || idx} className="relative pl-6">
                  {/* Marcador del timeline */}
                  <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {getTipoIcon(mov.tipo)}
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {mov.motivo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTipoBadge(mov.tipo)}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {mov.fecha}
                        </span>
                      </div>
                    </div>

                    {mov.funcionario_nombre && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                          <User className="w-3 h-3 text-slate-400" />
                          Custodio: {mov.funcionario_nombre}
                        </span>
                        {mov.cargo_nombre && (
                          <span className="text-slate-400">Cargo: {mov.cargo_nombre}</span>
                        )}
                        {mov.agencia_nombre && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {mov.agencia_nombre}
                          </span>
                        )}
                      </div>
                    )}

                    {mov.observaciones && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <span className="font-medium text-slate-600 dark:text-slate-300">Nota: </span>
                        {mov.observaciones}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
