// src/app/(dashboard)/users/page.tsx
// Ruta del módulo de Usuarios en el dashboard

import { UsersPage } from '@/frontend/components/modules/users/UsersPage';

export const metadata = {
  title: 'Usuarios y Roles | Arkora',
  description: 'Gestión de usuarios y roles del sistema Arkora',
};

export default function UsersRoute() {
  return <UsersPage />;
}
