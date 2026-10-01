// src/frontend/components/modules/users/UsersTable.tsx
// Tabla de usuarios con ordenamiento, búsqueda, paginación y acciones CRUD
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { useUsers, useDeleteUser } from '@/frontend/hooks/useUsers';
import { Table, Badge, Button, ConfirmDialog, showToast } from '@/frontend/components/ui';
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { UserWithRole } from '@/types/user.types';

export interface UsersTableProps {
  search: string;
  roleFilter: string;
  onEditUser: (user: UserWithRole) => void;
}

export function UsersTable({ search, roleFilter, onEditUser }: UsersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);

  const { data, isLoading } = useUsers({ page, pageSize, search });
  const deleteUserMutation = useDeleteUser();

  const rawUsers = data && 'data' in data ? (data.data as UserWithRole[]) : [];
  const pagination = data && 'pagination' in data ? data.pagination : null;

  // Filtrar por rol si se seleccionó en UsersFilters
  const users = roleFilter
    ? rawUsers.filter((u) => u.roleId === Number(roleFilter))
    : rawUsers;

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const result = await deleteUserMutation.mutateAsync(userToDelete.id);
      if (result.success) {
        showToast.success('Usuario eliminado correctamente');
      } else {
        showToast.error(result.error?.message ?? 'Error al eliminar usuario');
      }
    } catch {
      showToast.error('Error de conexión al eliminar usuario');
    } finally {
      setUserToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Nombre',
      accessorKey: 'name' as keyof UserWithRole,
      cell: (row: UserWithRole) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</span>
      ),
    },
    {
      header: 'Usuario',
      accessorKey: 'username' as keyof UserWithRole,
      cell: (row: UserWithRole) => (
        <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">@{row.username}</span>
      ),
    },
    {
      header: 'Correo Electrónico',
      accessorKey: 'email' as keyof UserWithRole,
      cell: (row: UserWithRole) => (
        <span className="text-slate-600 dark:text-slate-300">{row.email}</span>
      ),
    },
    {
      header: 'Rol',
      cell: (row: UserWithRole) => {
        const roleName = row.role?.name || 'Solicitante';
        const variantMap: Record<string, 'info' | 'warning' | 'danger' | 'neutral'> = {
          Administrador: 'danger',
          Técnico: 'info',
          Supervisor: 'warning',
          Solicitante: 'neutral',
        };
        return <Badge variant={variantMap[roleName] || 'neutral'}>{roleName}</Badge>;
      },
    },
    {
      header: 'Estado',
      cell: (row: UserWithRole) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      cell: (row: UserWithRole) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditUser(row)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            onClick={() => setUserToDelete(row)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Table columns={columns} data={users} isLoading={isLoading} emptyMessage="No hay usuarios registrados." />

      {pagination && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando {Math.min((page - 1) * pageSize + 1, pagination.totalRecords)}–{Math.min(page * pageSize, pagination.totalRecords)} de {pagination.totalRecords} usuarios
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Anterior
            </Button>
            <span className="px-2 font-medium">
              Página {page} de {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="¿Eliminar usuario?"
        message={`Esta acción desactivará al usuario ${userToDelete?.name} (@${userToDelete?.username}).`}
        confirmText="Eliminar Usuario"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
