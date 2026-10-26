// src/backend/validators/equipo.validator.ts
// Esquemas Zod para validar datos del módulo de Equipos, Marcas, Tipos y Modelos
// Skill: api-design-principles, typescript-pro

import { z } from 'zod';

export const estadoOperativoEnum = z.enum([
  'operativo',
  'en_mantenimiento',
  'de_baja',
  'en_desuso',
]);

// Marca
export const createMarcaSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre de la marca es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z
    .string()
    .max(100)
    .optional()
    .transform((val, ctx) => {
      if (!val || val.trim() === '') {
        // Will be generated from nombre if empty
        return undefined;
      }
      return val.toLowerCase().replace(/\s+/g, '-');
    }),
  imagen: z.string().optional().nullable().or(z.literal('')),
  estado: z.boolean().optional().default(true),
});

export const updateMarcaSchema = createMarcaSchema.partial();

// Tipo de Equipo
export const createTipoEquipoSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre del tipo de equipo es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z.string().max(100).optional(),
  marcaId: z.coerce.number().int().positive().optional().nullable(),
  estado: z.boolean().optional().default(true),
});

export const updateTipoEquipoSchema = createTipoEquipoSchema.partial();

// Modelo
export const createModeloSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre del modelo es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z.string().max(100).optional().nullable(),
  marcaId: z.coerce.number({ required_error: 'La marca es obligatoria' }).int().positive('Selecciona una marca válida'),
  tipo_equipo_id: z.coerce.number().int().positive('Selecciona un tipo de equipo válido').optional().nullable(),
  especificaciones: z.record(z.unknown()).optional().nullable(),
  estado: z.boolean().optional().default(true),
});

export const updateModeloSchema = createModeloSchema.partial();

// Equipo
export const createEquipoSchema = z.object({
  numero_etiqueta: z
    .string({ required_error: 'El número de etiqueta/código de activo es obligatorio' })
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(100, 'No puede exceder 100 caracteres'),
  numero_serie: z.string().max(100).optional().nullable().or(z.literal('')),
  fecha_ingreso: z.string().optional().nullable().or(z.literal('')),
  observaciones: z.string().optional().nullable().or(z.literal('')),
  imagen: z.string().optional().nullable().or(z.literal('')),
  especificaciones: z.string().optional().nullable().or(z.record(z.unknown())).or(z.literal('')),
  estado_operativo: estadoOperativoEnum.default('operativo'),
  tipo_equipo_id: z.coerce
    .number({ required_error: 'El tipo de equipo es obligatorio' })
    .int()
    .positive('Selecciona un tipo de equipo válido'),
  marca_id: z.coerce
    .number({ required_error: 'La marca es obligatoria' })
    .int()
    .positive('Selecciona una marca válida'),
  modelo_id: z.coerce
    .number({ required_error: 'El modelo es obligatorio' })
    .int()
    .positive('Selecciona un modelo válido'),
  funcionario_id: z.coerce.number().int().positive().optional().nullable(),
});

export const updateEquipoSchema = createEquipoSchema.partial();

export type CreateMarcaInput = z.infer<typeof createMarcaSchema>;
export type UpdateMarcaInput = z.infer<typeof updateMarcaSchema>;

export type CreateTipoEquipoInput = z.infer<typeof createTipoEquipoSchema>;
export type UpdateTipoEquipoInput = z.infer<typeof updateTipoEquipoSchema>;

export type CreateModeloInput = z.infer<typeof createModeloSchema>;
export type UpdateModeloInput = z.infer<typeof updateModeloSchema>;

export type CreateEquipoInput = z.infer<typeof createEquipoSchema>;
export type UpdateEquipoInput = z.infer<typeof updateEquipoSchema>;
