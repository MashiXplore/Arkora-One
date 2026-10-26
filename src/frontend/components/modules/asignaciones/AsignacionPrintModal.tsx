// src/frontend/components/modules/asignaciones/AsignacionPrintModal.tsx
// Ficha / Acta de Asignación y Entrega de Equipos TI para impresión oficial y descarga de PDF real
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Modal, Button, showToast } from '@/frontend/components/ui';
import { Printer, Download, Eye, ShieldCheck } from 'lucide-react';
import type { EquipoWithRelations } from '@/types/equipo.types';
import { useConfig } from '@/frontend/hooks/useConfig';
import { downloadElementAsPdf, openElementPdfPreview } from '@/frontend/utils/pdfGenerator';

export interface AsignacionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: EquipoWithRelations | null;
}

export function AsignacionPrintModal({
  isOpen,
  onClose,
  equipo,
}: AsignacionPrintModalProps) {
  const { config } = useConfig();
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  if (!equipo) return null;

  const currentDate = new Date().toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleDownloadPdf = async () => {
    try {
      setIsPdfLoading(true);
      const filename = `Acta-Asignacion-${equipo.numero_etiqueta}.pdf`;
      await downloadElementAsPdf('printable-acta-asignacion', filename, {
        title: `Acta de Asignación ${equipo.numero_etiqueta}`,
        scale: 2,
      });
      showToast.success('PDF del Acta de Asignación descargado exitosamente');
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
      await openElementPdfPreview('printable-acta-asignacion', {
        title: `Acta de Asignación ${equipo.numero_etiqueta}`,
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

  const institucion = config.institucion;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acta Oficial de Asignación y Entrega"
      size="xl"
    >
      <div className="space-y-4">
        {/* Barra superior de acciones para PDF e Impresión */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Documento oficial de asignación y custodia de equipo TI.</span>
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
              title="Descargar Acta en formato PDF"
            >
              Descargar PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={handleBrowserPrint}
              title="Imprimir usando diálogo de impresora"
            >
              Imprimir
            </Button>
          </div>
        </div>

        {/* Hoja de impresión formal */}
        <div
          id="printable-acta-asignacion"
          className="bg-white text-slate-900 p-8 border border-slate-200 rounded-xl shadow-xs space-y-6 text-xs font-sans print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Membrete Oficial */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
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
              <span className="inline-block px-2.5 py-1 bg-slate-100 font-mono font-bold text-xs rounded border border-slate-300">
                ACTA #{equipo.numero_etiqueta}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Fecha: {currentDate}</p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Acta de Asignación y Compromiso de Custodia de Activo TI
            </h1>
            <p className="text-[11px] text-slate-600 max-w-xl mx-auto leading-tight">
              Por medio del presente documento, se hace entrega formal del activo informático detallado a continuación para el cumplimiento estricto de funciones laborales.
            </p>
          </div>

          {/* 1. Datos del Custodio / Funcionario */}
          <div className="space-y-2">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              1. Datos del Funcionario Responsable
            </div>
            <div className="grid grid-cols-2 gap-3 px-2">
              <div>
                <span className="text-slate-500 block text-[10px]">Nombre Completo:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {equipo.funcionario?.nombre || 'Custodio no asignado / En Almacén'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Cargo / Área:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {equipo.funcionario?.departamento_area || 'Área General'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Agencia / Sucursal:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {equipo.funcionario?.agencia?.nombre || 'Sede Central'} (
                  {equipo.funcionario?.agencia?.sucursal?.nombre || 'Bolivia'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Teléfono / Contacto:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {equipo.funcionario?.telefono || equipo.funcionario?.correo || 'Registrado en RRHH'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Datos del Equipo TI */}
          <div className="space-y-2">
            <div className="bg-slate-100 px-3 py-1 font-bold text-slate-800 text-[11px] uppercase tracking-wide rounded">
              2. Especificaciones del Activo TI Asignado
            </div>
            <div className="grid grid-cols-3 gap-3 px-2">
              <div>
                <span className="text-slate-500 block text-[10px]">Código de Activo / Etiqueta:</span>
                <span className="font-mono font-bold text-blue-700 text-xs">
                  {equipo.numero_etiqueta}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tipo de Equipo:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {equipo.tipo_equipo?.nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Marca y Modelo:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {equipo.marca?.nombre} {equipo.modelo?.nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Número de Serie:</span>
                <span className="font-mono text-slate-700 text-xs">
                  {equipo.numero_serie || 'S/N'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Estado Operativo:</span>
                <span className="font-semibold text-emerald-700 uppercase text-xs">
                  {equipo.estado_operativo}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Fecha de Asignación:</span>
                <span className="font-semibold text-slate-800 text-xs">{currentDate}</span>
              </div>
            </div>
          </div>

          {/* 3. Términos y Compromisos */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-700">Términos de Custodia y Responsabilidad:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>El activo es propiedad exclusiva de {institucion.nombre} y está destinado únicamente a labores institucionales.</li>
              <li>El custodio se compromete al cuidado adecuado, no manipulación interna de hardware y reporte inmediato de fallas o incidencias técnicas.</li>
              <li>En caso de reasignación, desvinculación o traslado de agencia, el equipo debe ser formalmente devuelto a la Unidad de TI.</li>
            </ul>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-12 pt-10 px-4">
            <div className="text-center border-t border-slate-400 pt-2">
              <span className="font-bold block text-slate-800 text-xs">Entrega Conforme:</span>
              <span className="text-[11px] text-slate-500">{institucion.departamento}</span>
              <span className="text-[10px] text-slate-400 block">Firma y Sello</span>
            </div>

            <div className="text-center border-t border-slate-400 pt-2">
              <span className="font-bold block text-slate-800 text-xs">
                {equipo.funcionario?.nombre || 'Recepción Conforme'}
              </span>
              <span className="text-[11px] text-slate-500">Custodio Responsable</span>
              <span className="text-[10px] text-slate-400 block">Firma y C.I.</span>
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
