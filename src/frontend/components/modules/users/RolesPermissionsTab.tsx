// src/frontend/components/modules/users/RolesPermissionsTab.tsx
// Componente para la gestión de matriz de permisos por Rol (RBAC)
// Skill: react-modernization

'use client';

import { usePermissions, useUpdatePermission, useSeedDemoUsers } from '@/frontend/hooks/usePermissions';
import { Table, Badge, Button, showToast } from '@/frontend/components/ui';
import { Shield, UserPlus, Check, X } from 'lucide-react';
import type { RoleWithPermissions, ModulePermission } from '@/types/role.types';

export function RolesPermissionsTab() {
  const { data: roles, isLoading } = usePermissions();
  const updatePermissionMutation = useUpdatePermission();
  const seedDemoUsersMutation = useSeedDemoUsers();

  const handleTogglePermission = async (
    roleId: number,
    moduleId: number,
    field: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete',
    currentValue: boolean
  ) => {
    try {
      await updatePermissionMutation.mutateAsync({
        roleId,
        moduleId,
        [field]: !currentValue,
      });
      showToast.success('Permiso actualizado correctamente');
    } catch {
      showToast.error('Error al actualizar el permiso');
    }
  };

  const handleSeedDemoUsers = async () => {
    try {
      await seedDemoUsersMutation.mutateAsync();
      showToast.success('Usuarios por defecto (Técnico, Supervisor, Solicitante) generados correctamente');
    } catch {
      showToast.error('Error al generar usuarios por defecto');
    }
  };

  const columns = [
    {
      header: 'Rol',
      cell: (row: RoleWithPermissions) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>
          </div>
          <span className="text-xs text-slate-500 mt-0.5">{row.description || 'Sin descripción'}</span>
        </div>
      ),
    },
    {
      header: 'Usuarios Asignados',
      cell: (row: RoleWithPermissions) => (
        <Badge variant={row._count?.users ? 'info' : 'neutral'}>
          {row._count?.users ?? 0} usuarios
        </Badge>
      ),
    },
    {
      header: 'Permisos por Módulo',
      cell: (row: RoleWithPermissions) => (
        <div className="flex flex-col gap-2 py-1">
          {row.rolePermissions.map((permission: ModulePermission) => (
            <div
              key={permission.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
            >
              <span className="font-medium text-slate-700 dark:text-slate-300 w-36 truncate">
                {permission.module.name}
              </span>

              <div className="flex items-center gap-3">
                {/* Crear */}
                <button
                  type="button"
                  onClick={() =>
                    handleTogglePermission(
                      row.id,
                      permission.moduleId,
                      'canCreate',
                      permission.canCreate
                    )
                  }
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                    permission.canCreate
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold'
                      : 'bg-slate-200/60 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
                  }`}
                  title="Crear registro"
                >
                  {permission.canCreate ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Crear</span>
                </button>

                {/* Leer */}
                <button
                  type="button"
                  onClick={() =>
                    handleTogglePermission(
                      row.id,
                      permission.moduleId,
                      'canRead',
                      permission.canRead
                    )
                  }
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                    permission.canRead
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                      : 'bg-slate-200/60 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
                  }`}
                  title="Ver datos"
                >
                  {permission.canRead ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Ver</span>
                </button>

                {/* Actualizar */}
                <button
                  type="button"
                  onClick={() =>
                    handleTogglePermission(
                      row.id,
                      permission.moduleId,
                      'canUpdate',
                      permission.canUpdate
                    )
                  }
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                    permission.canUpdate
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 font-semibold'
                      : 'bg-slate-200/60 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
                  }`}
                  title="Editar registros"
                >
                  {permission.canUpdate ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Editar</span>
                </button>

                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() =>
                    handleTogglePermission(
                      row.id,
                      permission.moduleId,
                      'canDelete',
                      permission.canDelete
                    )
                  }
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                    permission.canDelete
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-semibold'
                      : 'bg-slate-200/60 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
                  }`}
                  title="Eliminar registros"
                >
                  {permission.canDelete ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tarjeta de acción rápida para poblar usuarios de demostración */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl shadow-lg border border-blue-800">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Creación Automática de Usuarios por Defecto
          </h3>
          <p className="text-xs text-blue-200 mt-1">
            Genera cuentas iniciales para los roles <strong>Técnico</strong> (<code>tecnico@diaconia.org.bo</code>), <strong>Supervisor</strong> (<code>supervisor@diaconia.org.bo</code>) y <strong>Solicitante</strong> (<code>solicitante@diaconia.org.bo</code>) con contraseña por defecto <code>Password123!</code>.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSeedDemoUsers}
          isLoading={seedDemoUsersMutation.isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white shrink-0"
        >
          Generar Usuarios por Defecto
        </Button>
      </div>

      {/* Tabla de Matriz de Permisos */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
          Matriz de Permisos por Rol (RBAC)
        </h3>
        <p className="text-xs text-slate-500">
          Haz clic en cada botón de permiso para activarlo o desactivarlo dinámicamente para cada rol en cada módulo.
        </p>
        <Table
          columns={columns}
          data={roles ?? []}
          isLoading={isLoading}
          emptyMessage="No hay roles configurados."
        />
      </div>
    </div>
  );
}
