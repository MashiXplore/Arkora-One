// src/app/(dashboard)/work-orders/page.tsx
// Ruta principal de Órdenes de Servicio e Informes Técnicos

import { OrdenesPage } from '@/frontend/components/modules/ordenes/OrdenesPage';

export const metadata = {
  title: 'Órdenes de Servicio | Arkora',
  description: 'Gestión de órdenes de servicio, asignaciones técnicas e informes oficiales de TI',
};

export default function WorkOrdersRoute() {
  return <OrdenesPage />;
}
