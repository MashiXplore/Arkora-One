// src/app/(dashboard)/inventory/page.tsx
// Ruta del módulo de Equipos e Inventario en el dashboard

import { EquiposPage } from '@/frontend/components/modules/equipos/EquiposPage';

export const metadata = {
  title: 'Equipos e Inventario | Arkora',
  description: 'Gestión y control de inventario de equipos tecnológicos de la institución',
};

export default function InventoryRoute() {
  return <EquiposPage />;
}
