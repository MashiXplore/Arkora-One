// src/frontend/components/modules/users/UsersFilters.tsx
// Barra de búsqueda y filtros compacta con bordes claros nítidos
// Skill: react-modernization

'use client';

import { Search } from 'lucide-react';
import { Input, Select } from '@/frontend/components/ui';
import { useRoles } from '@/frontend/hooks/useRoles';

export interface UsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
}

export function UsersFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
}: UsersFiltersProps) {
  const { data: rolesData } = useRoles();

  const roleOptions = [
    { value: '', label: 'Todos los Roles' },
    ...(rolesData
      ? rolesData.map((r) => ({ value: String(r.id), label: r.name }))
      : [
          { value: '1', label: 'Administrador' },
          { value: '2', label: 'Técnico' },
          { value: '3', label: 'Supervisor' },
          { value: '4', label: 'Solicitante' },
        ]),
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm">
      <div className="w-full sm:w-80">
        <Input
          id="filter-search-users"
          placeholder="Buscar por nombre, usuario o email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          id="filter-role-users"
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          options={roleOptions}
        />
      </div>
    </div>
  );
}
