// src/frontend/components/modules/informes/InformesMetrics.tsx
// Métricas visuales adaptativas para el módulo de Informes Técnicos
// Regla 11: visual adaptativo, sin textos extensos, diseño profesional compacto

'use client';

import { useInformes } from '@/frontend/hooks/useOrdenes';
import { StatsCard } from '@/frontend/components/ui';
import {
  FileText,
  AlertTriangle,
  Cpu,
  Archive,
  BarChart2,
} from 'lucide-react';
import type { InformeWithRelations } from '@/types/orden.types';

export function InformesMetrics() {
  const { data, isLoading } = useInformes({ pageSize: 150 });
  const informes =
    data && 'data' in data && Array.isArray(data.data)
      ? (data.data as InformeWithRelations[])
      : [];

  const total = informes.length;

  // Clasificación
  const fallasGraves = informes.filter((inf) =>
    inf.tipo_informe.toLowerCase().includes('grave') ||
    inf.tipo_informe.toLowerCase().includes('falla')
  ).length;

  const cambioPiezas = informes.filter((inf) =>
    inf.tipo_informe.toLowerCase().includes('pieza') ||
    inf.tipo_informe.toLowerCase().includes('reemplazo') ||
    (inf.solucion_aplicada && (
      inf.solucion_aplicada.toLowerCase().includes('repuesto') ||
      inf.solucion_aplicada.toLowerCase().includes('cambio') ||
      inf.solucion_aplicada.toLowerCase().includes('disco') ||
      inf.solucion_aplicada.toLowerCase().includes('memoria')
    ))
  ).length;

  const bajas = informes.filter((inf) =>
    inf.tipo_informe.toLowerCase().includes('baja') ||
    inf.tipo_informe.toLowerCase().includes('obsolescencia')
  ).length;

  const otros = Math.max(0, total - (fallasGraves + cambioPiezas + bajas));

  const pctGraves = total > 0 ? Math.round((fallasGraves / total) * 100) : 0;
  const pctPiezas = total > 0 ? Math.round((cambioPiezas / total) * 100) : 0;
  const pctBajas = total > 0 ? Math.round((bajas / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* 4 Tarjetas KPI */}
      <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatsCard
          title="Total Informes"
          value={total}
          icon={<FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          description="Dictámenes oficiales emitidos"
          isLoading={isLoading}
        />

        <StatsCard
          title="Fallas Graves"
          value={fallasGraves}
          icon={<AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          description={`${pctGraves}% del total`}
          isLoading={isLoading}
        />

        <StatsCard
          title="Cambio de Piezas"
          value={cambioPiezas}
          icon={<Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          description={`${pctPiezas}% con repuestos`}
          isLoading={isLoading}
        />

        <StatsCard
          title="Dictamen de Baja"
          value={bajas}
          icon={<Archive className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          description={`${pctBajas}% equipos obsoletos`}
          isLoading={isLoading}
        />
      </div>

      {/* Gráfico Visual Adaptativo */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100">
            <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Naturaleza de Informes Técnicos</span>
          </div>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
            {total} emitidos
          </span>
        </div>

        {/* Barra de composición multicromática */}
        <div className="space-y-1.5 mb-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${pctGraves}%` }}
              title={`Falla Grave: ${fallasGraves}`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${pctPiezas}%` }}
              title={`Cambio Piezas: ${cambioPiezas}`}
            />
            <div
              className="bg-purple-500 h-full transition-all duration-500"
              style={{ width: `${pctBajas}%` }}
              title={`Bajas: ${bajas}`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Graves ({fallasGraves})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Piezas ({cambioPiezas})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Bajas ({bajas})
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span>Resolución técnica documentada</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            100% Auditables
          </span>
        </div>
      </div>
    </div>
  );
}
