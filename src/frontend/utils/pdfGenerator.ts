// src/frontend/utils/pdfGenerator.ts
// Utilidad profesional para generación y descarga real de documentos PDF
// Usa html2canvas + jsPDF para renderizado fiel de alta definición
// Soporta tanto elementos HTMLElement como selectores de ID de string

'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  marginMm?: number;
  scale?: number;
  title?: string;
}

/**
 * Obtiene el elemento HTML seguro a partir de una referencia o ID de string
 */
function resolveElement(target: HTMLElement | string): HTMLElement {
  if (typeof target === 'string') {
    const el = document.getElementById(target);
    if (!el) {
      throw new Error(`Elemento con ID "${target}" no encontrado en el DOM.`);
    }
    return el;
  }
  return target;
}

/**
 * Genera y descarga un archivo PDF directamente desde un elemento DOM HTML
 */
export async function downloadElementAsPdf(
  elementOrId: HTMLElement | string,
  filenameOrOptions?: string | PdfExportOptions,
  extraOptions?: Partial<PdfExportOptions>
): Promise<void> {
  const element = resolveElement(elementOrId);

  let opts: PdfExportOptions = {};
  if (typeof filenameOrOptions === 'string') {
    opts = { filename: filenameOrOptions, ...extraOptions };
  } else if (filenameOrOptions) {
    opts = { ...filenameOrOptions, ...extraOptions };
  }

  const canvas = await html2canvas(element, {
    scale: opts.scale ?? 2, // 2x DPI para texto y líneas vectoriales nítidas
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: opts.orientation || 'portrait',
    unit: 'mm',
    format: opts.format || 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  const defaultName = opts.title ? `${opts.title}.pdf` : 'documento-arkora.pdf';
  const nameToUse = opts.filename || defaultName;
  const finalName = nameToUse.endsWith('.pdf') ? nameToUse : `${nameToUse}.pdf`;

  pdf.save(finalName);
}

/**
 * Genera el PDF y lo abre en una nueva pestaña del navegador para visualización previa
 */
export async function openElementPdfPreview(
  elementOrId: HTMLElement | string,
  options?: Partial<PdfExportOptions>
): Promise<void> {
  const element = resolveElement(elementOrId);

  const canvas = await html2canvas(element, {
    scale: options?.scale ?? 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: options?.orientation || 'portrait',
    unit: 'mm',
    format: options?.format || 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
}
