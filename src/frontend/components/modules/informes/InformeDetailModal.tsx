// src/frontend/components/modules/informes/InformeDetailModal.tsx
// Modal de consulta y detalle completo de un Informe Técnico
// Skill: react-modernization

'use client';

import { useInforme } from '@/frontend/hooks/useOrdenes';
import { Modal, Badge, Button } from '@/frontend/components/ui';
import {
  FileText,
  Laptop,
  User,
  Building2,
  Calendar,
  Wrench,
  CheckCircle2,
  Printer,
  Shield,
  Camera,
} from 'lucide-react';
import type { InformeWithRelations } from '@/types/orden.types';

export interface InformeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  informeId: number | null;
  onPrint?: (informe: InformeWithRelations) => void;
}

export function InformeDetailModal({
  isOpen,
  onClose,
  informeId,
  onPrint,
}: InformeDetailModalProps) {
  const { data, isLoading } = useInforme(informeId ?? 0);
  const informe = data && 'data' in data ? (data.data as InformeWithRelations) : null;

  if (!isOpen) return null;

  const formatDate = (dateVal: string | Date | null) => {
    if (!dateVal) return '-';
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
      title={informe ? `Informe Técnico: INF-${String(informe.id).padStart(5, '0')}` : 'Cargando Informe...'}
      size="lg"
    >
      {isLoading || !informe ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Cargando datos del informe técnico...
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Header Resumen */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                {informe.titulo}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha: {formatDate(informe.fecha)}
              </span>
            </div>
            <Badge variant="info">{informe.tipo_informe}</Badge>
          </div>

          {/* Grid de Orden y Equipo Vinculados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Tarjeta Orden de Servicio */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 pb-1 border-b border-slate-100 dark:border-slate-800">
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                <span>Orden de Servicio Vinculada</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">N° Orden:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {informe.orden.numero_orden}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Servicio Realizado:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {informe.orden.tipo_servicio}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Solicitante:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {informe.orden.funcionario.nombre}
                </span>
              </div>
            </div>

            {/* Tarjeta Equipo TI */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 pb-1 border-b border-slate-100 dark:border-slate-800">
                <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                <span>Activo Informático Evaluado</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Código Etiqueta:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {informe.orden.equipo.numero_etiqueta}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tipo y Modelo:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {informe.orden.equipo.marca?.nombre} {informe.orden.equipo.modelo?.nombre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Técnico Autor:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {informe.tecnico.name}
                </span>
              </div>
            </div>
          </div>

          {/* Fotografía del Activo TI */}
          {informe.orden.equipo.imagen && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                Fotografía Oficial del Activo TI ({informe.orden.equipo.numero_etiqueta})
              </span>
              <div className="w-full h-44 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src={informe.orden.equipo.imagen}
                  alt={informe.orden.equipo.numero_etiqueta}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Diagnóstico Final y Solución */}
          <div className="space-y-3">
            <div>
              <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diagnóstico Técnico Final y Evaluación
              </span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {informe.diagnostico_final || 'Sin observaciones detalladas.'}
              </div>
            </div>

            <div>
              <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Solución Aplicada / Cambio de Repuestos y Piezas
              </span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {informe.solucion_aplicada || 'No se registraron cambios de componentes.'}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              {onPrint && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => onPrint(informe)}
                >
                  Imprimir Ficha Oficial
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
