// src/backend/validators/user.validator.ts
// Esquemas Zod para validar los datos del módulo de Usuarios
// Skill: api-design-principles, typescript-pro

import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  username: z
    .string({ required_error: 'El usuario es obligatorio' })
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(80, 'El usuario no puede exceder 80 caracteres')
    .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos'),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('Ingresa un correo electrónico válido')
    .max(150, 'El correo no puede exceder 150 caracteres'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  roleId: z
    .number({ required_error: 'El rol es obligatorio' })
    .int()
    .positive('El rol debe ser válido'),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).max(150).optional(),
  username: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Usuario inválido')
    .optional(),
  email: z.string().email().max(150).optional(),
  password: z.string().min(8).max(100).optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo es obligatorio' })
    .email('Ingresa un correo válido'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'Ingresa tu contraseña'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
