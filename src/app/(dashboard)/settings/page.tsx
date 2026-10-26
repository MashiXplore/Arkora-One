// src/app/(dashboard)/settings/page.tsx
// Ruta del módulo de Configuración del Sistema (firmas de órdenes e informes, parámetros)

import { ConfiguracionPage } from '@/frontend/components/modules/configuracion/ConfiguracionPage';

export const metadata = {
  title: 'Configuración | Arkora',
  description: 'Configuración de firmas para órdenes de servicio e informes técnicos oficiales',
};

export default function SettingsRoute() {
  return <ConfiguracionPage />;
}
