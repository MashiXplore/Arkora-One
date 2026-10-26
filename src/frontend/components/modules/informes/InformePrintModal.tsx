// src/frontend/components/modules/informes/InformePrintModal.tsx
// Ficha oficial de Informe Técnico para impresión, generación y descarga de PDF real
// Incluye soporte dinámico de firmas configurables y fotografía del equipo
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Modal, Button, showToast } from '@/frontend/components/ui';
import { Printer, Download, Eye, Camera, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { InformeWithRelations } from '@/types/orden.types';
import { useConfig } from '@/frontend/hooks/useConfig';
import { downloadElementAsPdf, openElementPdfPreview } from '@/frontend/utils/pdfGenerator';

export interface InformePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  informe: InformeWithRelations | null;
}

export function InformePrintModal({
  isOpen,
  onClose,
  informe,
}: InformePrintModalProps) {
  const { config } = useConfig();
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  if (!informe) return null;

  const formatDate = (dateVal: string | Date | null) => {
    if (!dateVal) return '-';
    return new Date(dateVal).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownloadPdf = async () => {
    try {
      setIsPdfLoading(true);
      const filename = `Informe-Tecnico-INF-${String(informe.id).padStart(5, '0')}.pdf`;
      await downloadElementAsPdf('printable-informe-tecnico', filename, {
        title: informe.titulo,
        scale: 2,
      });
      showToast.success('PDF generado y descargado exitosamente');
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
      await openElementPdfPreview('printable-informe-tecnico', {
        title: informe.titulo,
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

  const firmas = config.firmasInformes || [];
  const institucion = config.institucion;

  // Grid columns calculator for signatures
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
      title="Ficha Oficial de Informe Técnico"
      size="xl"
    >
      <div className="space-y-4">
        {/* Barra superior de acciones para PDF e Impresión */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Documento oficial con firmas dinámicas y fotografía del equipo.</span>
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
              title="Descargar documento en formato PDF auténtico"
            >
              Descargar PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={handleBrowserPrint}
              title="Imprimir usando el diálogo de la impresora"
            >
              Imprimir
            </Button>
          </div>
        </div>

        {/* ══════════ HOJA FORMAL INSTITUCIONAL PARA PDF / IMPRESIÓN ══════════ */}
        <div
          id="printable-informe-tecnico"
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
              <span className="inline-block px-3 py-1 bg-slate-100 font-mono font-bold text-xs rounded border border-slate-300 text-slate-900">
                INF-{String(informe.id).padStart(5, '0')}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                Fecha: {formatDate(informe.fecha)}
              </p>
            </div>
          </div>

          {/* Título y Clasificación */}
          <div className="text-center space-y-1 py-1">
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {informe.titulo}
            </h1>
            <span className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-700">
              Clasificación: {informe.tipo_informe}
            </span>
          </div>

          {/* 1. Datos de Referencia y Activo */}
          <div className="space-y-1.5">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              1. Datos de Referencia y Activo Evaluado
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-2">
              <div>
                <span className="text-slate-500 block text-[10px]">N° Orden de Servicio:</span>
                <span className="font-mono font-bold text-blue-700 text-xs">
                  {informe.orden.numero_orden}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Código de Activo / Etiqueta:</span>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {informe.orden.equipo.numero_etiqueta}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Equipo TI:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {informe.orden.equipo.marca?.nombre} {informe.orden.equipo.modelo?.nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Número de Serie:</span>
                <span className="font-mono text-slate-700 text-xs">
                  {informe.orden.equipo.numero_serie || 'S/N'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px]">Funcionario Solicitante:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {informe.orden.funcionario.nombre} ({informe.orden.funcionario.departamento_area || 'Área Operativa'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Agencia / Dependencia:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {informe.agencia?.nombre || informe.orden.funcionario.departamento_area || 'Sede Central'}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════ SECCIÓN DESTACADA: FOTOGRAFÍA DEL EQUIPO ══════════ */}
          {informe.orden.equipo.imagen && (
            <div className="space-y-1.5">
              <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded flex items-center justify-between">
                <span>Fotografía y Evidencia del Activo TI</span>
                <span className="text-[10px] font-normal text-slate-500 lowercase">
                  activo [{informe.orden.equipo.numero_etiqueta}]
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                <div className="w-48 h-36 rounded-md bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 p-1">
                  <img
                    src={informe.orden.equipo.imagen}
                    alt={informe.orden.equipo.numero_etiqueta}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-slate-600 text-xs">
                  <span className="font-bold text-slate-800 text-xs block">
                    Registro Visual del Equipo Evaluado
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Fotografía tomada y archivada en la base de datos institucional para constancia de estado físico, modelo, número de serie y condición general al momento de la intervención técnica.
                  </p>
                  <div className="pt-1 flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                    <span>Etiqueta: {informe.orden.equipo.numero_etiqueta}</span>
                    <span>•</span>
                    <span>Marca: {informe.orden.equipo.marca?.nombre}</span>
                    <span>•</span>
                    <span>Modelo: {informe.orden.equipo.modelo?.nombre}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Diagnóstico Técnico Final */}
          <div className="space-y-1.5">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              2. Diagnóstico Técnico y Evaluación de Fallas
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-sans min-h-[60px]">
              {informe.diagnostico_final || 'Sin observaciones de diagnóstico final detalladas.'}
            </div>
          </div>

          {/* 3. Solución Técnica / Repuestos y Cambio de Piezas */}
          <div className="space-y-1.5">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              3. Solución Aplicada / Repuestos y Cambio de Piezas Requeridos
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-sans min-h-[60px]">
              {informe.solucion_aplicada || 'Procedimiento técnico completado conforme a normativas institucionales.'}
            </div>
          </div>

          {/* ══════════ FIRMAS DINÁMICAS CONFIGURABLES ══════════ */}
          <div className="pt-8">
            <div className={`grid ${getGridColsClass(firmas.length)} gap-6 px-2`}>
              {firmas.map((firma) => {
                // Si la firma corresponde al técnico evaluador, mostrar el nombre del técnico
                const isTecnico =
                  firma.cargo.toLowerCase().includes('técnico') ||
                  firma.cargo.toLowerCase().includes('tecnico') ||
                  firma.cargo.toLowerCase().includes('evaluador');

                const displayName = isTecnico ? informe.tecnico.name : '';

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

        {/* Footer del Modal */}
        <div className="flex justify-end pt-2 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
