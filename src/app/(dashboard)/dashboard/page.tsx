// src/app/(dashboard)/dashboard/page.tsx
// Dashboard principal con métricas globales y soporte para temas claro/oscuro
// Skill: react-modernization

import { StatsCard, Breadcrumbs } from '@/frontend/components/ui';
import { Laptop, AlertTriangle, Wrench, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-3">
      {/* Fila superior compacta de navegación */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Dashboard General' }]} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Total Equipos"
          value="—"
          icon={<Laptop className="w-5 h-5 text-blue-500" />}
          description="Inventario global"
        />
        <StatsCard
          title="Incidencias Abiertas"
          value="—"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          description="Pendientes de atención"
        />
        <StatsCard
          title="En Reparación"
          value="—"
          icon={<Wrench className="w-5 h-5 text-rose-500" />}
          description="Órdenes de servicio activas"
        />
        <StatsCard
          title="Usuarios Activos"
          value="1"
          icon={<Users className="w-5 h-5 text-emerald-500" />}
          description="Cuentas registradas"
        />
      </div>
    </div>
  );
}
