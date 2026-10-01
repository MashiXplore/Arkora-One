// src/backend/validators/role.validator.ts
// Esquemas Zod para validación de Roles y Permisos (RBAC)

import { z } from 'zod';

export const updatePermissionSchema = z.object({
  roleId: z.number({ required_error: 'El ID de rol es obligatorio' }).int().positive(),
  moduleId: z.number({ required_error: 'El ID de módulo es obligatorio' }).int().positive(),
  canCreate: z.boolean().optional(),
  canRead: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canDelete: z.boolean().optional(),
});

export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
