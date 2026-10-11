// src/app/(dashboard)/ordenes/page.tsx
// Ruta directa del módulo de Órdenes

import { OrdenesPage } from '@/frontend/components/modules/ordenes/OrdenesPage';

export const metadata = {
  title: 'Órdenes de Servicio | Arkora',
  description: 'Gestión y control de soporte técnico, mantenimiento y reparaciones de equipos TI',
};

export default function OrdenesRoute() {
  return <OrdenesPage />;
}
