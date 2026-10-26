// src/app/(dashboard)/assignments/page.tsx
// Ruta del módulo independiente de Asignaciones, Custodia y Seguimiento de Equipos TI

import { AsignacionesPage } from '@/frontend/components/modules/asignaciones/AsignacionesPage';

export const metadata = {
  title: 'Asignaciones y Custodia de Equipos | Arkora',
  description: 'Control de asignaciones de equipos a agencias y funcionarios, custodia y trazabilidad',
};

export default function AssignmentsRoute() {
  return <AsignacionesPage />;
}
