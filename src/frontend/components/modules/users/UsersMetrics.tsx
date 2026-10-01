// src/frontend/components/modules/users/UsersMetrics.tsx
// Métricas ejecutivas con gráficos SVG interactivos de Donut y Barras por Rol
// Skill: react-modernization, modern-web-guidance-plugin

'use client';

import { Users, UserCheck, UserX, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useUserMetrics } from '@/frontend/hooks/useUsers';

interface RoleMetricItem {
  roleId: number;
  roleName: string;
  count: number;
}

interface UserMetricsResponse {
  total: number;
  active: number;
  inactive: number;
  byRole?: RoleMetricItem[];
}

export function UsersMetrics() {
  const { data, isLoading } = useUserMetrics();

  const metrics: UserMetricsResponse =
    data && 'success' in data && data.success && data.data
      ? (data.data as UserMetricsResponse)
      : { total: 0, active: 0, inactive: 0, byRole: [] };

  const total = metrics.total || 0;
  const activeCount = metrics.active || 0;
  const inactiveCount = metrics.inactive || 0;

  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 0;
  const inactivePercent = total > 0 ? Math.round((inactiveCount / total) * 100) : 0;

  // Calculo de proporciones SVG Donut Chart (circunferencia r=36 -> 226.19)
  const circumference = 2 * Math.PI * 36;
  const activeStroke = (activePercent / 100) * circumference;
  const inactiveStroke = (inactivePercent / 100) * circumference;

  // Roles por defecto si byRole no viene cargado
  const roleMetrics: RoleMetricItem[] =
    metrics.byRole && metrics.byRole.length > 0
      ? metrics.byRole
      : [
          { roleId: 1, roleName: 'Administrador', count: activeCount },
          { roleId: 2, roleName: 'Técnico', count: 0 },
          { roleId: 3, roleName: 'Supervisor', count: 0 },
          { roleId: 4, roleName: 'Solicitante', count: 0 },
        ];

  const maxRoleCount = Math.max(...roleMetrics.map((r: RoleMetricItem) => r.count), 1);

  const roleColors: Record<string, { bar: string; text: string }> = {
    Administrador: { bar: 'from-blue-600 to-indigo-600', text: 'text-blue-600 dark:text-blue-400' },
    Técnico: { bar: 'from-emerald-500 to-teal-600', text: 'text-emerald-600 dark:text-emerald-400' },
    Supervisor: { bar: 'from-amber-500 to-orange-500', text: 'text-amber-600 dark:text-amber-400' },
    Solicitante: { bar: 'from-purple-500 to-indigo-500', text: 'text-purple-600 dark:text-purple-400' },
  };

  return (
    <div className="space-y-3">
      {/* Fila 1: Tarjetas Resumen KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Usuarios */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Cuentas
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {isLoading ? '—' : total}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Usuarios en el sistema</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Usuarios Activos */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Usuarios Activos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {isLoading ? '—' : activeCount}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {isLoading ? '—' : `${activePercent}%`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Acceso habilitado</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Usuarios Inactivos */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Usuarios Inactivos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                {isLoading ? '—' : inactiveCount}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                {isLoading ? '—' : `${inactivePercent}%`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Acceso deshabilitado</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Fila 2: Gráficos Visuales de Torta / Donut y Barras por Rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Gráfico 1: Gráfico Donut de Estado */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Estado de Accesos
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Proporción</span>
          </div>

          <div className="flex items-center justify-around gap-4 py-1">
            {/* SVG Donut Ring */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                {/* Background Ring */}
                <circle
                  cx="45"
                  cy="45"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                {/* Inactive Arc */}
                {inactiveCount > 0 && (
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    stroke="#f43f5e"
                    strokeWidth="10"
                    strokeDasharray={`${inactiveStroke} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700"
                  />
                )}
                {/* Active Arc */}
                {activeCount > 0 && (
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${activeStroke} ${circumference}`}
                    strokeDashoffset={-inactiveStroke}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700"
                  />
                )}
              </svg>
              {/* Etiqueta Central */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">
                  {total}
                </span>
                <span className="text-[9px] font-semibold text-slate-400">Total</span>
              </div>
            </div>

            {/* Leyenda del gráfico de torta */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Activos</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{activeCount}</span>
                  <span className="text-[10px] text-slate-400">({activePercent}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Inactivos</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{inactiveCount}</span>
                  <span className="text-[10px] text-slate-400">({inactivePercent}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Gráfico de Barras por Rol */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Distribución de Usuarios por Rol
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">RBAC</span>
          </div>

          {/* Barras SVG / HTML por cada Rol */}
          <div className="grid grid-cols-4 gap-2 items-end h-28 pt-2 px-1">
            {roleMetrics.map((r: RoleMetricItem) => {
              const heightPercent = Math.max(12, Math.round((r.count / maxRoleCount) * 100));
              const styleConfig = roleColors[r.roleName] || roleColors['Solicitante'];

              return (
                <div key={r.roleId || r.roleName} className="flex flex-col items-center h-full justify-end group">
                  {/* Etiqueta de conteo arriba de la barra */}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {r.count}
                  </span>

                  {/* Barra vertical animada */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-lg h-full max-h-20 flex items-end p-0.5">
                    <div
                      className={`w-full rounded-t-md bg-gradient-to-t ${styleConfig.bar} transition-all duration-500 group-hover:brightness-110 shadow-sm`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Nombre del rol */}
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1.5 truncate max-w-full text-center">
                    {r.roleName === 'Administrador' ? 'Admin' : r.roleName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
