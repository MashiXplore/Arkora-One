// src/app/(dashboard)/equipos/page.tsx
// Ruta directa del módulo de Equipos

import { EquiposPage } from '@/frontend/components/modules/equipos/EquiposPage';

export const metadata = {
  title: 'Equipos | Arkora',
  description: 'Gestión y control de inventario de equipos tecnológicos de la institución',
};

export default function EquiposRoute() {
  return <EquiposPage />;
}
