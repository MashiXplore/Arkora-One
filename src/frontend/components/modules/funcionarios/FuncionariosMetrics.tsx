// src/frontend/components/modules/funcionarios/FuncionariosMetrics.tsx
// Métricas visuales del módulo de funcionarios con gráficos adaptativos (Donut + Barras)
// Skill: react-modernization, modern-web-guidance-plugin

'use client';

import { Users, UserCheck, Building2, Briefcase, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useFuncionarioMetrics } from '@/frontend/hooks/useFuncionarios';
import type { FuncionarioMetrics } from '@/types/funcionario.types';

export function FuncionariosMetrics() {
  const { data, isLoading } = useFuncionarioMetrics();

  const metrics: FuncionarioMetrics =
    data && 'success' in data && data.success && data.data
      ? (data.data as FuncionarioMetrics)
      : {
          total: 0,
          active: 0,
          inactive: 0,
          totalSucursales: 0,
          totalAgencias: 0,
          totalCargos: 0,
          bySucursal: [],
          byCargo: [],
        };

  const total = metrics.total || 0;
  const activeCount = metrics.active || 0;
  const inactiveCount = metrics.inactive || 0;

  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 0;
  const inactivePercent = total > 0 ? Math.round((inactiveCount / total) * 100) : 0;

  // Cálculo SVG Donut Chart (r=36 -> Circunferencia 226.19)
  const circumference = 2 * Math.PI * 36;
  const activeStroke = (activePercent / 100) * circumference;
  const inactiveStroke = (inactivePercent / 100) * circumference;

  const sucursalData = metrics.bySucursal || [];
  const maxSucursalCount = Math.max(...sucursalData.map((s) => s.count), 1);

  return (
    <div className="space-y-3">
      {/* Fila 1: Tarjetas Resumen KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Funcionarios */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Funcionarios</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : total}
            </span>
            <span className="text-xs text-slate-400">institucionales</span>
          </div>
        </div>

        {/* Activos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Activos en Planta</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? '...' : activeCount}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              {activePercent}% del total
            </span>
          </div>
        </div>

        {/* Estructura (Sucursales / Agencias) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sucursales / Agencias</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : metrics.totalSucursales}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              / {metrics.totalAgencias} agencias
            </span>
          </div>
        </div>

        {/* Cargos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cargos / Puestos</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : metrics.totalCargos}
            </span>
            <span className="text-xs text-slate-400">perfiles definidos</span>
          </div>
        </div>
      </div>

      {/* Fila 2: Gráficos Visuales (Donut de Estado + Distribución por Sucursal) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gráfico 1: Donut de Estados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <PieIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Estado de Funcionarios</span>
            </div>
            <span className="text-[11px] text-slate-400">{total} reg.</span>
          </div>

          <div className="flex items-center justify-around py-1">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 88 88">
                {/* Background Track */}
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Inactivos */}
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  className="stroke-rose-500 transition-all duration-700"
                  strokeWidth="8"
                  strokeDasharray={`${inactiveStroke} ${circumference}`}
                  strokeDashoffset="0"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Activos */}
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  className="stroke-emerald-500 transition-all duration-700"
                  strokeWidth="8"
                  strokeDasharray={`${activeStroke} ${circumference}`}
                  strokeDashoffset={-inactiveStroke}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-bold text-slate-900 dark:text-white">{activePercent}%</span>
                <span className="text-[10px] text-slate-400">Activo</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Activos:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Inactivos:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{inactiveCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Distribución de Funcionarios por Sucursal (Barras SVG dinámicas) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Distribución por Sucursal Regional</span>
            </div>
            <span className="text-[11px] text-slate-400">Personal asignado</span>
          </div>

          <div className="space-y-2 py-0.5">
            {sucursalData.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">Sin datos registrados</div>
            ) : (
              sucursalData.map((suc) => {
                const percent = Math.round((suc.count / maxSucursalCount) * 100);
                return (
                  <div key={suc.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{suc.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {suc.count} <span className="font-normal text-slate-400">personas</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
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
