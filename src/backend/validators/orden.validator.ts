// src/backend/validators/orden.validator.ts
// Esquemas Zod para validación de datos de Órdenes de Servicio e Informes
// Skill: api-design-principles, typescript-pro

import { z } from 'zod';

export const estadoOrdenEnum = z.enum([
  'creado',
  'en_proceso',
  'finalizado',
  'entregado',
  'cancelado',
]);

export const tipoServicioEnum = z.enum([
  'reparacion',
  'mantenimiento_preventivo',
  'mantenimiento_correctivo',
  'diagnostico',
  'instalacion',
]);

export const prioridadEnum = z.enum([
  'baja',
  'media',
  'alta',
  'urgente',
]);

export const createOrdenSchema = z.object({
  numero_orden: z
    .string()
    .max(30, 'El número de orden no puede exceder 30 caracteres')
    .optional(),
  fecha: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  estado: estadoOrdenEnum.optional().default('creado'),
  tipo_servicio: tipoServicioEnum.optional().default('reparacion'),
  prioridad: prioridadEnum.optional().default('media'),
  diagnostico_inicial: z.string().optional().nullable(),
  fecha_estimada_entrega: z
    .string()
    .or(z.date())
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  especificaciones: z.record(z.unknown()).optional().nullable(),
  id_recepcion: z.coerce
    .number({ required_error: 'El recepcionista es obligatorio' })
    .int()
    .positive('Recepcionista inválido'),
  id_tecnico: z.coerce
    .number()
    .int()
    .positive('Técnico inválido')
    .optional()
    .nullable(),
  id_equipo: z.coerce
    .number({ required_error: 'Debe seleccionar un equipo' })
    .int()
    .positive('Seleccione un equipo válido'),
  id_funcionario: z.coerce
    .number({ required_error: 'Debe seleccionar un funcionario' })
    .int()
    .positive('Seleccione un funcionario válido'),
});

export const updateOrdenSchema = createOrdenSchema.partial();

export const createInformeSchema = z.object({
  tipo_informe: z
    .string({ required_error: 'El tipo de informe es obligatorio' })
    .min(2, 'El tipo de informe debe tener al menos 2 caracteres')
    .max(100, 'El tipo no puede exceder 100 caracteres'),
  titulo: z
    .string({ required_error: 'El título del informe es obligatorio' })
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z.string().optional().nullable(),
  diagnostico_final: z.string().optional().nullable(),
  solucion_aplicada: z.string().optional().nullable(),
  fecha: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  archivo_ruta: z.string().max(255).optional().nullable(),
  nueva_foto_equipo: z.string().optional().nullable(),
  foto_opcion: z.enum(['equipo', 'nueva', 'ninguna']).optional().nullable(),
  user_id: z.coerce
    .number({ required_error: 'El técnico autor es obligatorio' })
    .int()
    .positive('Técnico inválido'),
  orden_id: z.coerce
    .number({ required_error: 'Debe asociar el informe a una orden' })
    .int()
    .positive('Orden inválida'),
  agencia_id: z.coerce
    .number()
    .int()
    .positive('Agencia inválida')
    .optional()
    .nullable(),
});

export const updateInformeSchema = createInformeSchema.partial();

export type CreateOrdenInput = z.infer<typeof createOrdenSchema>;
export type UpdateOrdenInput = z.infer<typeof updateOrdenSchema>;
export type CreateInformeInput = z.infer<typeof createInformeSchema>;
export type UpdateInformeInput = z.infer<typeof updateInformeSchema>;
