// src/frontend/services/role.service.ts
// Servicio frontend para operaciones de Roles y Permisos (RBAC)
// Skill: typescript-pro, react-modernization

import type { ApiResponse } from '@/types/api.types';
import type { RoleWithPermissions, UpdatePermissionPayload } from '@/types/role.types';
import type { Role } from '@/types/user.types';

export const roleService = {
  /** Obtiene todos los roles del sistema */
  async getRoles(): Promise<Role[]> {
    const res = await fetch('/api/v1/roles');
    const json: ApiResponse<Role[]> = await res.json();
    if (!json.success) {
      throw new Error(json.error.message);
    }
    return json.data;
  },

  /** Obtiene la matriz completa de permisos por rol */
  async getPermissions(): Promise<RoleWithPermissions[]> {
    const res = await fetch('/api/v1/permissions');
    const json: ApiResponse<RoleWithPermissions[]> = await res.json();
    if (!json.success) {
      throw new Error(json.error.message);
    }
    return json.data;
  },

  /** Actualiza un permiso específico */
  async updatePermission(payload: UpdatePermissionPayload): Promise<void> {
    const res = await fetch('/api/v1/permissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json: ApiResponse<unknown> = await res.json();
    if (!json.success) {
      throw new Error(json.error.message);
    }
  },

  /** Genera usuarios por defecto para los demás roles */
  async seedDemoUsers(): Promise<void> {
    const res = await fetch('/api/v1/users/seed', { method: 'POST' });
    const json: ApiResponse<unknown> = await res.json();
    if (!json.success) {
      throw new Error(json.error.message);
    }
  },
};
