// src/app/(dashboard)/funcionarios/page.tsx
// Ruta del módulo de Funcionarios en el dashboard

import { FuncionariosPage } from '@/frontend/components/modules/funcionarios/FuncionariosPage';

export const metadata = {
  title: 'Funcionarios | Arkora',
  description: 'Gestión de funcionarios, sucursales, agencias y cargos de la institución',
};

export default function FuncionariosRoute() {
  return <FuncionariosPage />;
}
