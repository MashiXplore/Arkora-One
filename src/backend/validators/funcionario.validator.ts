// src/backend/validators/funcionario.validator.ts
// Esquemas Zod para validar datos del módulo de Funcionarios y Estructura Organizacional
// Skill: api-design-principles, typescript-pro

import { z } from 'zod';

// Funcionario
export const createFuncionarioSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  correo: z
    .string()
    .email('Ingresa un correo electrónico válido')
    .max(150, 'El correo no puede exceder 150 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
  telefono: z
    .string()
    .max(50, 'El teléfono no puede exceder 50 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
  departamento_area: z
    .string()
    .max(100, 'El departamento/área no puede exceder 100 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
  cargoId: z
    .coerce
    .number({ required_error: 'El cargo es obligatorio' })
    .int()
    .positive('Selecciona un cargo válido'),
  agenciaId: z
    .coerce
    .number({ required_error: 'La agencia es obligatoria' })
    .int()
    .positive('Selecciona una agencia válida'),
  estado: z.boolean().optional().default(true),
});

export const updateFuncionarioSchema = createFuncionarioSchema.partial();

// Sucursal
export const createSucursalSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre de la sucursal es obligatorio' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  direccion: z.string().optional().nullable().or(z.literal('')),
  telefono: z.string().max(50, 'El teléfono no puede exceder 50 caracteres').optional().nullable().or(z.literal('')),
  estado: z.boolean().optional().default(true),
});

export const updateSucursalSchema = createSucursalSchema.partial();

// Agencia
export const createAgenciaSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre de la agencia es obligatorio' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  direccion: z.string().optional().nullable().or(z.literal('')),
  telefono: z.string().max(50, 'El teléfono no puede exceder 50 caracteres').optional().nullable().or(z.literal('')),
  sucursalId: z.coerce.number().int().positive('Selecciona una sucursal válida').optional().nullable(),
  estado: z.boolean().optional().default(true),
});

export const updateAgenciaSchema = createAgenciaSchema.partial();

// Cargo
export const createCargoSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre del cargo es obligatorio' })
    .min(2, 'El cargo debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  descripcion: z.string().optional().nullable().or(z.literal('')),
  estado: z.boolean().optional().default(true),
});

export const updateCargoSchema = createCargoSchema.partial();

export type CreateFuncionarioInput = z.infer<typeof createFuncionarioSchema>;
export type UpdateFuncionarioInput = z.infer<typeof updateFuncionarioSchema>;

export type CreateSucursalInput = z.infer<typeof createSucursalSchema>;
export type UpdateSucursalInput = z.infer<typeof updateSucursalSchema>;

export type CreateAgenciaInput = z.infer<typeof createAgenciaSchema>;
export type UpdateAgenciaInput = z.infer<typeof updateAgenciaSchema>;

export type CreateCargoInput = z.infer<typeof createCargoSchema>;
export type UpdateCargoInput = z.infer<typeof updateCargoSchema>;
