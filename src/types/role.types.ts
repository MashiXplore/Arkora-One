// src/types/role.types.ts
// Tipos para el módulo de Roles y Permisos (RBAC)

export interface ModulePermission {
  id: number;
  roleId: number;
  moduleId: number;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  module: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  description: string | null;
  rolePermissions: ModulePermission[];
  _count?: {
    users: number;
  };
}

export interface UpdatePermissionPayload {
  roleId: number;
  moduleId: number;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}
