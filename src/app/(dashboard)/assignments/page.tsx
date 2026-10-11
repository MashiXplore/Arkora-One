// src/app/(dashboard)/assignments/page.tsx
// Ruta del módulo de Asignaciones y Carga Técnica

import { OrdenesPage } from '@/frontend/components/modules/ordenes/OrdenesPage';

export const metadata = {
  title: 'Asignaciones de Servicio | Arkora',
  description: 'Control de asignaciones de equipos a técnicos y carga operativa de trabajo',
};

export default function AssignmentsRoute() {
  return <OrdenesPage />;
}
