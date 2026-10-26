// src/frontend/components/modules/asignaciones/AsignacionesMetrics.tsx
// Métricas visuales de custodia, asignación y disponibilidad de equipos TI
// Regla 11: visual adaptativo, sin textos extensos, diseño profesional compacto

'use client';

import { useEquipos, useEquipoMetrics } from '@/frontend/hooks/useEquipos';
import { StatsCard } from '@/frontend/components/ui';
import {
  ClipboardCheck,
  PackageOpen,
  Sparkles,
  Building2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import type { EquipoWithRelations } from '@/types/equipo.types';

export function AsignacionesMetrics() {
  const { data: metricsData, isLoading: isMetricsLoading } = useEquipoMetrics();
  const { data: equiposData, isLoading: isEquiposLoading } = useEquipos({ pageSize: 150 });

  const metrics =
    metricsData && 'data' in metricsData && metricsData.data ? metricsData.data : null;

  const equipos =
    equiposData && 'data' in equiposData && Array.isArray(equiposData.data)
      ? (equiposData.data as EquipoWithRelations[])
      : [];

  const total = metrics?.total ?? 0;
  const asignados = metrics?.asignados ?? 0;
  const disponibles = metrics?.disponibles ?? 0;

  // Equipos nuevos (ingresados recientemente o en stock operativo)
  const nuevosEnStock = equipos.filter(
    (e) => !e.funcionario_id && e.estado_operativo === 'operativo'
  ).length;

  const pctAsignados = total > 0 ? Math.round((asignados / total) * 100) : 0;
  const pctDisponibles = total > 0 ? Math.round((disponibles / total) * 100) : 0;

  // Distribución por agencias
  const agencyMap = new Map<string, number>();
  equipos.forEach((e) => {
    if (e.funcionario?.agencia?.nombre) {
      const name = e.funcionario.agencia.nombre;
      agencyMap.set(name, (agencyMap.get(name) || 0) + 1);
    }
  });

  const agencyEntries = Array.from(agencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const maxAgencyCount = agencyEntries.length > 0 ? Math.max(...agencyEntries.map((e) => e[1])) : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* 4 KPI Cards */}
      <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatsCard
          title="Equipos Asignados"
          value={asignados}
          icon={<ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          description={`${pctAsignados}% bajo custodia`}
          trend={{ value: pctAsignados, isPositive: true }}
          isLoading={isMetricsLoading}
        />

        <StatsCard
          title="En Almacén / Stock"
          value={disponibles}
          icon={<PackageOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          description={`${pctDisponibles}% disponible`}
          isLoading={isMetricsLoading}
        />

        <StatsCard
          title="Nuevos por Asignar"
          value={nuevosEnStock}
          icon={<Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          description="Listos para entrega"
          isLoading={isEquiposLoading}
        />

        <StatsCard
          title="Total Activos TI"
          value={total}
          icon={<Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          description="Parque total registrado"
          isLoading={isMetricsLoading}
        />
      </div>

      {/* Gráfico Visual Adaptativo: Gauge de Custodia y Top Agencias */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100">
            <PieChartIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Tasa de Custodia Activa</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {pctAsignados}% asignado
          </span>
        </div>

        {/* Barra de progreso de custodia */}
        <div className="space-y-1.5 mb-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${pctAsignados}%` }}
              title={`Asignados: ${asignados}`}
            />
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${pctDisponibles}%` }}
              title={`En Almacén: ${disponibles}`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Asignados ({asignados})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Almacén ({disponibles})
            </span>
          </div>
        </div>

        {/* Mini distribución por Agencia */}
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Top Agencias con Equipos
          </span>
          {agencyEntries.length === 0 ? (
            <span className="text-[11px] text-slate-400 italic">Sin datos de agencias</span>
          ) : (
            agencyEntries.map(([name, count]) => {
              const barWidth = Math.max(8, Math.round((count / maxAgencyCount) * 100));
              return (
                <div key={name} className="flex items-center gap-2 text-[11px]">
                  <span className="truncate w-36 text-slate-600 dark:text-slate-300" title={name}>
                    {name}
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-[10px] w-5 text-right">
                    {count}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
