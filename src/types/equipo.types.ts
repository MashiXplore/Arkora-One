// src/types/equipo.types.ts
// Tipos compartidos para el módulo de Equipos, Marcas, Tipos de Equipo y Modelos
// Skill: typescript-pro

import type { Funcionario } from './funcionario.types';

export type EstadoOperativoType = 'operativo' | 'en_mantenimiento' | 'de_baja' | 'en_desuso';

export interface Marca {
  id: number;
  nombre: string;
  slug: string;
  imagen: string | null;
  estado: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    modelos?: number;
    equipos?: number;
    tipo_equipos?: number;
  };
}

export interface CreateMarcaPayload {
  nombre: string;
  slug?: string;
  imagen?: string | null;
  estado?: boolean;
}

export interface UpdateMarcaPayload extends Partial<CreateMarcaPayload> {}

export interface TipoEquipo {
  id: number;
  nombre: string;
  slug: string;
  estado: boolean;
  marcaId: number | null;
  marca?: Marca | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    modelos?: number;
    equipos?: number;
  };
}

export interface CreateTipoEquipoPayload {
  nombre: string;
  slug?: string;
  marcaId?: number | null;
  estado?: boolean;
}

export interface UpdateTipoEquipoPayload extends Partial<CreateTipoEquipoPayload> {}

export interface Modelo {
  id: number;
  nombre: string;
  slug: string | null;
  especificaciones?: Record<string, unknown> | null;
  estado: boolean;
  marcaId: number;
  marca?: Marca;
  tipo_equipo_id: number | null;
  tipo_equipo?: TipoEquipo | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    equipos?: number;
  };
}

export interface CreateModeloPayload {
  nombre: string;
  slug?: string | null;
  especificaciones?: Record<string, unknown> | null;
  marcaId: number;
  tipo_equipo_id?: number | null;
  estado?: boolean;
}

export interface UpdateModeloPayload extends Partial<CreateModeloPayload> {}

export interface Equipo {
  id: number;
  numero_etiqueta: string;
  numero_serie: string | null;
  fecha_ingreso: string | Date | null;
  observaciones: string | null;
  imagen: string | null;
  especificaciones?: string | Record<string, unknown> | null;
  estado_operativo: EstadoOperativoType;
  tipo_equipo_id: number;
  marca_id: number;
  modelo_id: number;
  funcionario_id: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EquipoWithRelations extends Equipo {
  tipo_equipo: TipoEquipo;
  marca: Marca;
  modelo: Modelo;
  funcionario?: (Funcionario & {
    cargo?: { id: number; nombre: string; descripcion?: string | null } | null;
    agencia?: {
      id: number;
      nombre: string;
      sucursal?: { id: number; nombre: string } | null;
    } | null;
  }) | null;
}

export interface CreateEquipoPayload {
  numero_etiqueta: string;
  numero_serie?: string | null;
  fecha_ingreso?: string | null;
  observaciones?: string | null;
  imagen?: string | null;
  especificaciones?: string | Record<string, unknown> | null;
  estado_operativo?: EstadoOperativoType;
  tipo_equipo_id: number;
  marca_id: number;
  modelo_id: number;
  funcionario_id?: number | null;
}

export interface UpdateEquipoPayload extends Partial<CreateEquipoPayload> {}

export interface EquipoMetricsDistribution {
  id: number;
  name: string;
  count: number;
}

export interface EquipoMetrics {
  total: number;
  operativo: number;
  en_mantenimiento: number;
  de_baja: number;
  en_desuso: number;
  asignados: number;
  disponibles: number;
  totalMarcas: number;
  totalTipos: number;
  totalModelos: number;
  byTipo: EquipoMetricsDistribution[];
  byMarca: EquipoMetricsDistribution[];
}
