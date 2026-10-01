// src/backend/services/role.service.ts
// Lógica de negocio para la gestión de roles y matriz de permisos
// Skill: api-design-principles, typescript-pro

import { roleRepository } from '@/backend/repositories/role.repository';
import type { UpdatePermissionInput } from '@/backend/validators/role.validator';

export const roleService = {
  async getRoles() {
    return roleRepository.findAll();
  },

  async getPermissionsMatrix() {
    return roleRepository.findAllWithPermissions();
  },

  async updatePermission(data: UpdatePermissionInput) {
    return roleRepository.updatePermission(data);
  },

  async seedDemoUsers() {
    return roleRepository.seedDemoUsers();
  },
};
