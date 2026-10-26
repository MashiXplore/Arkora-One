// src/app/(dashboard)/informes/page.tsx
// Ruta del módulo independiente de Informes Técnicos y Dictámenes Oficiales TI

import { InformesPage } from '@/frontend/components/modules/informes/InformesPage';

export const metadata = {
  title: 'Informes Técnicos | Arkora',
  description: 'Gestión y emisión de informes técnicos oficiales, dictámenes de baja y cambio de repuestos',
};

export default function InformesRoute() {
  return <InformesPage />;
}
