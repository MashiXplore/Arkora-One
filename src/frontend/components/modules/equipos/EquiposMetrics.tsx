// src/frontend/components/modules/equipos/EquiposMetrics.tsx
// Métricas visuales del módulo de Equipos con gráficos adaptativos (Donut de Estado Operativo + Distribución)
// Skill: react-modernization, modern-web-guidance-plugin

'use client';

import { Laptop, CheckCircle2, Wrench, AlertOctagon, Layers, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useEquipoMetrics } from '@/frontend/hooks/useEquipos';
import type { EquipoMetrics } from '@/types/equipo.types';

export function EquiposMetrics() {
  const { data, isLoading } = useEquipoMetrics();

  const metrics: EquipoMetrics =
    data && 'success' in data && data.success && data.data
      ? (data.data as EquipoMetrics)
      : {
          total: 0,
          operativo: 0,
          en_mantenimiento: 0,
          de_baja: 0,
          en_desuso: 0,
          asignados: 0,
          disponibles: 0,
          totalMarcas: 0,
          totalTipos: 0,
          totalModelos: 0,
          byTipo: [],
          byMarca: [],
        };

  const total = metrics.total || 0;
  const operativo = metrics.operativo || 0;
  const mantenimiento = metrics.en_mantenimiento || 0;
  const baja = metrics.de_baja || 0;
  const desuso = metrics.en_desuso || 0;

  const opPercent = total > 0 ? Math.round((operativo / total) * 100) : 0;
  const mantPercent = total > 0 ? Math.round((mantenimiento / total) * 100) : 0;
  const bajaPercent = total > 0 ? Math.round(((baja + desuso) / total) * 100) : 0;

  // Donut SVG circumference (r=36 -> 226.19)
  const circumference = 2 * Math.PI * 36;
  const opStroke = (opPercent / 100) * circumference;
  const mantStroke = (mantPercent / 100) * circumference;
  const bajaStroke = (bajaPercent / 100) * circumference;

  const tipoData = metrics.byTipo || [];
  const maxTipoCount = Math.max(...tipoData.map((t) => t.count), 1);

  return (
    <div className="space-y-3">
      {/* Fila 1: Tarjetas Resumen KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Equipos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Equipos TI</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : total}
            </span>
            <span className="text-xs text-slate-400">activos inventariados</span>
          </div>
        </div>

        {/* Operativos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Operativos en Uso</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? '...' : operativo}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              {opPercent}% funcionalidad
            </span>
          </div>
        </div>

        {/* En Mantenimiento */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">En Mantenimiento</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {isLoading ? '...' : mantenimiento}
            </span>
            <span className="text-xs text-slate-400">en soporte técnico</span>
          </div>
        </div>

        {/* Marcas y Modelos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Marcas / Modelos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : metrics.totalMarcas}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              marcas / {metrics.totalModelos} modelos
            </span>
          </div>
        </div>
      </div>

      {/* Fila 2: Gráficos Visuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gráfico 1: Donut Estado Operativo */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <PieIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Estado Operativo</span>
            </div>
            <span className="text-[11px] text-slate-400">{total} equipos</span>
          </div>

          <div className="flex items-center justify-around py-1">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="none"
                />
                {/* De baja / Desuso */}
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  className="stroke-rose-500 transition-all duration-700"
                  strokeWidth="8"
                  strokeDasharray={`${bajaStroke} ${circumference}`}
                  strokeDashoffset="0"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* En Mantenimiento */}
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  className="stroke-amber-500 transition-all duration-700"
                  strokeWidth="8"
                  strokeDasharray={`${mantStroke} ${circumference}`}
                  strokeDashoffset={-bajaStroke}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Operativo */}
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  className="stroke-emerald-500 transition-all duration-700"
                  strokeWidth="8"
                  strokeDasharray={`${opStroke} ${circumference}`}
                  strokeDashoffset={-(bajaStroke + mantStroke)}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-bold text-slate-900 dark:text-white">{opPercent}%</span>
                <span className="text-[10px] text-slate-400">Operativo</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Operativo:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{operativo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Mantenimiento:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{mantenimiento}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Baja/Desuso:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{baja + desuso}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Distribución por Tipo de Equipo */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Distribución por Tipo de Equipo</span>
            </div>
            <span className="text-[11px] text-slate-400">Categorías de hardware</span>
          </div>

          <div className="space-y-2 py-0.5">
            {tipoData.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">Sin datos registrados</div>
            ) : (
              tipoData.map((tipo) => {
                const percent = Math.round((tipo.count / maxTipoCount) * 100);
                return (
                  <div key={tipo.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{tipo.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {tipo.count} <span className="font-normal text-slate-400">unidades</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.max(percent, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
