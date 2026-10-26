// src/frontend/components/modules/ordenes/OrdenPrintModal.tsx
// Ficha de Orden de Servicio Técnico con descarga de PDF real y firmas dinámicas
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Modal, Button, showToast } from '@/frontend/components/ui';
import { Printer, Download, Eye, ShieldCheck, Wrench } from 'lucide-react';
import type { OrdenWithRelations } from '@/types/orden.types';
import { useConfig } from '@/frontend/hooks/useConfig';
import { downloadElementAsPdf, openElementPdfPreview } from '@/frontend/utils/pdfGenerator';

export interface OrdenPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenWithRelations | null;
}

export function OrdenPrintModal({
  isOpen,
  onClose,
  orden,
}: OrdenPrintModalProps) {
  const { config } = useConfig();
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  if (!orden) return null;

  const formatDate = (dateVal: string | Date | null) => {
    if (!dateVal) return '-';
    return new Date(dateVal).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatServicioLabel = (tipo: string) => {
    switch (tipo) {
      case 'instalacion':
        return 'Software (S.O., Programas, Configuración)';
      case 'reparacion':
        return 'Hardware (Componentes, Reparación, Mantenimiento)';
      case 'diagnostico':
        return 'Diagnóstico General / Evaluación';
      default:
        return tipo;
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsPdfLoading(true);
      const filename = `Orden-Servicio-${orden.numero_orden}.pdf`;
      await downloadElementAsPdf('printable-orden-servicio', filename, {
        title: `Orden de Servicio ${orden.numero_orden}`,
        scale: 2,
      });
      showToast.success('PDF de Orden de Servicio generado y descargado exitosamente');
    } catch (err) {
      showToast.error('No se pudo generar el archivo PDF');
      console.error(err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handlePreviewPdf = async () => {
    try {
      setIsPdfLoading(true);
      await openElementPdfPreview('printable-orden-servicio', {
        title: `Orden de Servicio ${orden.numero_orden}`,
        scale: 2,
      });
    } catch (err) {
      showToast.error('No se pudo abrir la vista previa del PDF');
      console.error(err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const firmas = config.firmasOrdenes || [];
  const institucion = config.institucion;

  const getGridColsClass = (total: number) => {
    if (total <= 1) return 'grid-cols-1 max-w-xs mx-auto';
    if (total === 2) return 'grid-cols-2';
    if (total === 3) return 'grid-cols-3';
    return 'grid-cols-2 sm:grid-cols-4';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Oficial de Orden de Servicio"
      size="xl"
    >
      <div className="space-y-4">
        {/* Barra superior de control para PDF e Impresión */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Ficha de orden con firmas dinámicas configurables y descarga de PDF real.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              onClick={handlePreviewPdf}
              isLoading={isPdfLoading}
              title="Abrir PDF en nueva pestaña"
            >
              Ver PDF
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadPdf}
              isLoading={isPdfLoading}
              title="Descargar PDF auténtico de la Orden"
            >
              Descargar PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={handleBrowserPrint}
              title="Imprimir usando diálogo del navegador"
            >
              Imprimir
            </Button>
          </div>
        </div>

        {/* ══════════ HOJA FORMAL INSTITUCIONAL PARA PDF / IMPRESIÓN ══════════ */}
        <div
          id="printable-orden-servicio"
          className="bg-white text-slate-900 p-8 border border-slate-200 rounded-xl shadow-xs space-y-5 text-xs font-sans print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Membrete Oficial Dinámico */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-blue-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-xs">
                A
              </div>
              <div>
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 leading-tight">
                  {institucion.nombre}
                </h2>
                <p className="text-[11px] text-slate-600 font-medium">
                  {institucion.departamento}
                </p>
                <p className="text-[10px] text-slate-400">
                  {institucion.subtitulo}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 font-mono font-bold text-sm rounded border border-slate-300 text-slate-900">
                {orden.numero_orden}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                Fecha: {formatDate(orden.fecha)}
              </p>
            </div>
          </div>

          <div className="text-center space-y-1 py-1">
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Ficha Técnica de Orden de Servicio
            </h1>
            <div className="flex justify-center gap-3 text-[11px]">
              <span className="font-semibold text-slate-700">
                Estado: <span className="uppercase text-blue-700 font-bold">{orden.estado}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-700">
                Prioridad: <span className="uppercase text-amber-700 font-bold">{orden.prioridad}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-700">
                Tipo: <span className="text-slate-900 font-bold">{formatServicioLabel(orden.tipo_servicio)}</span>
              </span>
            </div>
          </div>

          {/* 1. Datos del Solicitante y Ubicación */}
          <div className="space-y-1.5">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              1. Datos del Solicitante y Dependencia
            </div>
            <div className="grid grid-cols-2 gap-3 px-2">
              <div>
                <span className="text-slate-500 block text-[10px]">Funcionario Solicitante:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {orden.funcionario.nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Departamento / Área:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {orden.funcionario.departamento_area || 'Área General'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Agencia / Sucursal:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {orden.funcionario.agencia?.nombre || 'Sede Central'} (
                  {orden.funcionario.agencia?.sucursal?.nombre || 'Bolivia'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Contacto:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {orden.funcionario.telefono || orden.funcionario.correo || 'Registrado en RRHH'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Datos del Equipo TI */}
          <div className="space-y-1.5">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              2. Datos del Activo TI a Intervenir
            </div>
            <div className="grid grid-cols-3 gap-3 px-2">
              <div>
                <span className="text-slate-500 block text-[10px]">Código de Activo / Etiqueta:</span>
                <span className="font-mono font-bold text-blue-700 text-xs">
                  {orden.equipo.numero_etiqueta}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tipo de Equipo:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {orden.equipo.tipo_equipo?.nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Marca y Modelo:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {orden.equipo.marca?.nombre} {orden.equipo.modelo?.nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Número de Serie:</span>
                <span className="font-mono text-slate-700 text-xs">
                  {orden.equipo.numero_serie || 'S/N'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Técnico Asignado:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {orden.tecnico?.name || 'Por asignar'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Fecha Estimada de Entrega:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {formatDate(orden.fecha_estimada_entrega)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Motivo / Diagnóstico Inicial Reportado */}
          <div className="space-y-1.5">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              3. Motivo del Requerimiento / Falla Reportada
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-sans min-h-[50px]">
              {orden.diagnostico_inicial || 'Sin descripción detallada reportada.'}
            </div>
          </div>

          {/* ══════════ FIRMAS DINÁMICAS CONFIGURABLES ══════════ */}
          <div className="pt-8">
            <div className={`grid ${getGridColsClass(firmas.length)} gap-6 px-2`}>
              {firmas.map((firma) => {
                const cargoLower = firma.cargo.toLowerCase();
                let displayName = '';

                if (cargoLower.includes('solicitante') || cargoLower.includes('custodio') || cargoLower.includes('funcionario')) {
                  displayName = orden.funcionario.nombre;
                } else if (cargoLower.includes('técnico') || cargoLower.includes('tecnico') || cargoLower.includes('soporte')) {
                  displayName = orden.tecnico?.name || '';
                }

                return (
                  <div key={firma.id} className="text-center pt-2">
                    <div className="border-t border-slate-400 pt-1.5 space-y-0.5">
                      <span className="font-bold block text-slate-900 text-xs min-h-[16px]">
                        {displayName || '\u00A0'}
                      </span>
                      <span className="font-semibold block text-slate-700 text-[11px]">
                        {firma.cargo}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {firma.dependencia || firma.aclaracion}
                      </span>
                      {firma.leyenda && (
                        <span className="text-[9px] text-slate-400 italic block">
                          {firma.leyenda}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
