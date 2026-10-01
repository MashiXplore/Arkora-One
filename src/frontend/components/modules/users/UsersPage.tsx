// src/frontend/components/modules/users/UsersPage.tsx
// Vista contenedora principal del módulo de Usuarios y Roles (solo ensambla)
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { UsersMetrics } from './UsersMetrics';
import { UsersFilters } from './UsersFilters';
import { UsersTable } from './UsersTable';
import { UserCreateModal } from './UserCreateModal';
import { UserEditModal } from './UserEditModal';
import { RolesPermissionsTab } from './RolesPermissionsTab';
import { Breadcrumbs, Button, Tabs } from '@/frontend/components/ui';
import { UserPlus, Users as UsersIcon, ShieldCheck } from 'lucide-react';
import type { UserWithRole } from '@/types/user.types';

export function UsersPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const tabs = [
    { id: 'users', label: 'Lista de Usuarios', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'permissions', label: 'Roles y Matriz de Permisos (RBAC)', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Botón de Acción */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Usuarios y Permisos' }]} />

        {activeTab === 'users' && (
          <Button
            id="btn-new-user"
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Métricas del módulo con gráficos visuales */}
      <UsersMetrics />

      {/* Navegación por pestañas */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenido de Pestaña 1: Usuarios */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <UsersFilters
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
          />
          <UsersTable
            search={search}
            roleFilter={roleFilter}
            onEditUser={(user) => setEditingUser(user)}
          />
        </div>
      )}

      {/* Contenido de Pestaña 2: Roles y Permisos */}
      {activeTab === 'permissions' && <RolesPermissionsTab />}

      {/* Modal de creación */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal de edición */}
      <UserEditModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
      />
    </div>
  );
}
