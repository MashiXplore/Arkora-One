// src/frontend/components/modules/ordenes/InformeDetailModal.tsx
// Modal de vista e impresión oficial del Informe Técnico Diaconía TI
// Skill: react-modernization

'use client';

import { useInforme } from '@/frontend/hooks/useOrdenes';
import { Modal, Button, Badge } from '@/frontend/components/ui';
import { Printer, Laptop, User, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { InformeWithRelations } from '@/types/orden.types';

export interface InformeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  informeId: number | null;
}

export function InformeDetailModal({ isOpen, onClose, informeId }: InformeDetailModalProps) {
  const { data, isLoading } = useInforme(informeId || 0);

  const informe =
    data && 'data' in data && data.data ? (data.data as InformeWithRelations) : null;

  const formatDate = (dateVal: string | Date | null) => {
    if (!dateVal) return '-';
    return new Date(dateVal).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Informe Técnico Oficial"
      size="xl"
    >
      {isLoading || !informe ? (
        <div className="py-12 text-center text-sm text-slate-400">
          Cargando datos del informe técnico...
        </div>
      ) : (
        <div className="space-y-4 print:p-0">
          {/* Encabezado Institucional del Documento */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {informe.tipo_informe}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  REF: {informe.orden.numero_orden}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {informe.titulo}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="block font-medium text-slate-400">Fecha de emisión:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {formatDate(informe.fecha)}
              </span>
            </div>
          </div>

          {/* Datos del Equipo y Funcionario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-blue-500" />
                Equipo Intervenido
              </span>
              <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
                {informe.orden.equipo.numero_etiqueta}
              </div>
              <div className="text-slate-500">
                {informe.orden.equipo.marca?.nombre} {informe.orden.equipo.modelo?.nombre}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Solicitante / Dependencia
              </span>
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                {informe.orden.funcionario.nombre}
              </div>
              <div className="text-slate-500">
                {informe.orden.funcionario.departamento_area || 'Área'} · {informe.agencia?.nombre || 'Agencia central'}
              </div>
            </div>
          </div>

          {/* Diagnóstico Final */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              1. Diagnóstico Técnico Final y Causa Raíz
            </span>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {informe.diagnostico_final || 'Sin detalle de diagnóstico final registrado.'}
            </div>
          </div>

          {/* Solución Aplicada */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              2. Trabajos Realizados y Solución Aplicada
            </span>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {informe.solucion_aplicada || 'Sin detalle de procedimientos realizados registrado.'}
            </div>
          </div>

          {/* Cuadro de Firmas Oficiales para Impresión */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="w-40 border-b border-slate-400 dark:border-slate-600 mb-1 pt-8" />
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {informe.tecnico?.name}
              </span>
              <span className="text-[11px] text-slate-400">Técnico Responsable TI</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-40 border-b border-slate-400 dark:border-slate-600 mb-1 pt-8" />
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {informe.orden.funcionario.nombre}
              </span>
              <span className="text-[11px] text-slate-400">Conformidad del Solicitante</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Imprimir Informe
            </Button>

            <Button variant="primary" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
