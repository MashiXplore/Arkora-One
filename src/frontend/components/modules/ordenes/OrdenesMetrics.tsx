// src/frontend/components/modules/ordenes/OrdenesMetrics.tsx
// Métricas visuales del módulo de Órdenes de Servicio e Informes
// Skill: react-modernization, modern-web-guidance-plugin

'use client';

import {
  Wrench,
  Clock,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useOrdenMetrics } from '@/frontend/hooks/useOrdenes';
import type { OrdenMetrics } from '@/types/orden.types';

export function OrdenesMetrics() {
  const { data, isLoading } = useOrdenMetrics();

  const metrics: OrdenMetrics =
    data && 'success' in data && data.success && data.data
      ? (data.data as OrdenMetrics)
      : {
          total: 0,
          creado: 0,
          en_proceso: 0,
          finalizado: 0,
          entregado: 0,
          cancelado: 0,
          conInforme: 0,
          sinInforme: 0,
          byPrioridad: [],
          byTipoServicio: [],
          byTecnico: [],
        };

  const total = metrics.total || 0;
  const enProceso = metrics.en_proceso || 0;
  const creado = metrics.creado || 0;
  const resueltos = (metrics.finalizado || 0) + (metrics.entregado || 0);
  const conInforme = metrics.conInforme || 0;

  const resueltoPercent = total > 0 ? Math.round((resueltos / total) * 100) : 0;
  const procesoPercent = total > 0 ? Math.round((enProceso / total) * 100) : 0;
  const informePercent = total > 0 ? Math.round((conInforme / total) * 100) : 0;

  // Donut SVG circumference (r=36 -> 226.19)
  const circumference = 2 * Math.PI * 36;
  const pCreado = total > 0 ? (creado / total) * circumference : 0;
  const pProceso = total > 0 ? (enProceso / total) * circumference : 0;
  const pResuelto = total > 0 ? (resueltos / total) * circumference : 0;
  const pCancelado = total > 0 ? ((metrics.cancelado || 0) / total) * circumference : 0;

  // Servicios
  const tiposServicio = metrics.byTipoServicio || [];
  const maxServicio = Math.max(...tiposServicio.map((t) => t.count), 1);

  // Formato legible para nombres de servicio
  const formatServicioName = (name: string) => {
    switch (name) {
      case 'mantenimiento_preventivo':
        return 'Mant. Preventivo';
      case 'mantenimiento_correctivo':
        return 'Mant. Correctivo';
      case 'reparacion':
        return 'Reparación';
      case 'diagnostico':
        return 'Diagnóstico';
      case 'instalacion':
        return 'Instalación';
      default:
        return name;
    }
  };

  return (
    <div className="space-y-3">
      {/* Fila 1: Tarjetas Resumen KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Órdenes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Órdenes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : total}
            </span>
            <span className="text-xs text-slate-400">órdenes emitidas</span>
          </div>
        </div>

        {/* En Atención Activa */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">En Atención / Taller</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {isLoading ? '...' : enProceso + creado}
            </span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">
              {creado} nuevas / {enProceso} en curso
            </span>
          </div>
        </div>

        {/* Resueltas / Entregadas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Finalizadas / Listas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? '...' : resueltos}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              {resueltoPercent}% tasa de éxito
            </span>
          </div>
        </div>

        {/* Con Informe Técnico */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Informes Técnicos</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {isLoading ? '...' : conInforme}
            </span>
            <span className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium">
              {informePercent}% documentadas
            </span>
          </div>
        </div>
      </div>

      {/* Fila 2: Gráficos Visuales Compactos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Gráfico 1: Donut de Estados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Estados de Órdenes
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {total} órdenes
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 py-1">
            {/* SVG Donut */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 88 88">
                {/* Background Ring */}
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  strokeWidth="8"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  fill="none"
                />
                {total > 0 && (
                  <>
                    {/* Creado (Azul) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      strokeWidth="8"
                      strokeDasharray={`${pCreado} ${circumference}`}
                      strokeDashoffset="0"
                      className="stroke-blue-500"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* En Proceso (Ámbar) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      strokeWidth="8"
                      strokeDasharray={`${pProceso} ${circumference}`}
                      strokeDashoffset={`${-pCreado}`}
                      className="stroke-amber-500"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Finalizado / Entregado (Esmeralda) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      strokeWidth="8"
                      strokeDasharray={`${pResuelto} ${circumference}`}
                      strokeDashoffset={`${-(pCreado + pProceso)}`}
                      className="stroke-emerald-500"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Cancelado (Rojo) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      strokeWidth="8"
                      strokeDasharray={`${pCancelado} ${circumference}`}
                      strokeDashoffset={`${-(pCreado + pProceso + pResuelto)}`}
                      className="stroke-rose-500"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {resueltoPercent}%
                </span>
                <span className="text-[9px] text-slate-400 font-medium">éxito</span>
              </div>
            </div>

            {/* Leyenda Compacta */}
            <div className="space-y-1 text-xs min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400 truncate">Creadas</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2">{creado}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400 truncate">En Proceso</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2">{enProceso}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400 truncate">Finalizadas</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2">{resueltos}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400 truncate">Canceladas</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2">{metrics.cancelado || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Distribución por Tipo de Servicio */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tipo de Servicio
            </span>
            <span className="text-[11px] text-slate-400">distribución</span>
          </div>

          <div className="space-y-2 py-1">
            {tiposServicio.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Sin datos registrados
              </div>
            ) : (
              tiposServicio.slice(0, 4).map((tipo) => {
                const pct = Math.round((tipo.count / maxServicio) * 100);
                return (
                  <div key={tipo.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 truncate font-medium">
                        {formatServicioName(tipo.name)}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 ml-2">
                        {tipo.count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfico 3: Prioridad y Carga Técnica */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Prioridad & Técnicos
            </span>
            <span className="text-[11px] text-slate-400">atención</span>
          </div>

          <div className="space-y-2 py-1">
            {/* Niveles de Prioridad */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {['urgente', 'alta', 'media', 'baja'].map((prio) => {
                const found = metrics.byPrioridad?.find((p) => p.name === prio);
                const count = found?.count || 0;
                const colors = {
                  urgente: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
                  alta: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
                  media: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
                  baja: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                }[prio];

                return (
                  <div
                    key={prio}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center ${colors}`}
                  >
                    <span className="text-xs font-bold">{count}</span>
                    <span className="text-[9px] uppercase tracking-wider font-medium truncate w-full">
                      {prio}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Técnicos con órdenes asignadas */}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Carga por Técnico
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {metrics.byTecnico && metrics.byTecnico.length > 0 ? (
                  metrics.byTecnico.map((tec) => (
                    <div
                      key={tec.id}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      <span className="truncate max-w-[90px]">{tec.name}</span>
                      <span className="px-1 py-0.2 rounded bg-blue-600 text-white font-bold text-[9px]">
                        {tec.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Sin técnicos asignados</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
