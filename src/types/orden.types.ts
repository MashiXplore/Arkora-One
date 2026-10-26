// src/types/orden.types.ts
// Tipos compartidos para el módulo de Órdenes de Servicio, Asignaciones e Informes
// Skill: typescript-pro

import type { User } from './user.types';
import type { EquipoWithRelations } from './equipo.types';
import type { FuncionarioWithRelations } from './funcionario.types';

export type EstadoOrden = 'creado' | 'en_proceso' | 'finalizado' | 'entregado' | 'cancelado';
export type TipoServicio = 'reparacion' | 'mantenimiento_preventivo' | 'mantenimiento_correctivo' | 'diagnostico' | 'instalacion';
export type Prioridad = 'baja' | 'media' | 'alta' | 'urgente';

export interface Orden {
  id: number;
  numero_orden: string;
  fecha: string | Date;
  estado: EstadoOrden;
  tipo_servicio: TipoServicio;
  prioridad: Prioridad;
  diagnostico_inicial: string | null;
  fecha_estimada_entrega: string | Date | null;
  especificaciones?: Record<string, unknown> | null;
  id_recepcion: number;
  id_tecnico: number | null;
  id_equipo: number;
  id_funcionario: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Informe {
  id: number;
  tipo_informe: string;
  titulo: string;
  descripcion: string | null;
  diagnostico_final: string | null;
  solucion_aplicada: string | null;
  fecha: string | Date;
  archivo_ruta: string | null;
  user_id: number;
  orden_id: number;
  agencia_id: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrdenWithRelations extends Orden {
  recepcionista: Pick<User, 'id' | 'name' | 'username' | 'email'>;
  tecnico?: Pick<User, 'id' | 'name' | 'username' | 'email'> | null;
  equipo: {
    id: number;
    numero_etiqueta: string;
    numero_serie: string | null;
    imagen?: string | null;
    marca: { id: number; nombre: string };
    modelo: { id: number; nombre: string };
    tipo_equipo: { id: number; nombre: string };
  };
  funcionario: {
    id: number;
    nombre: string;
    correo?: string | null;
    telefono?: string | null;
    departamento_area?: string | null;
    agencia?: {
      id: number;
      nombre: string;
      sucursal?: { id: number; nombre: string } | null;
    } | null;
    cargo?: { id: number; nombre: string } | null;
  };
  informe?: Informe | null;
}

export interface InformeWithRelations extends Informe {
  tecnico: Pick<User, 'id' | 'name' | 'username' | 'email'>;
  agencia?: { id: number; nombre: string } | null;
  orden: {
    id: number;
    numero_orden: string;
    fecha: string | Date;
    estado: EstadoOrden;
    tipo_servicio: TipoServicio;
    prioridad: Prioridad;
    equipo: {
      id: number;
      numero_etiqueta: string;
      numero_serie?: string | null;
      imagen?: string | null;
      marca: { id: number; nombre: string };
      modelo: { id: number; nombre: string };
      tipo_equipo?: { id: number; nombre: string } | null;
    };
    funcionario: {
      id: number;
      nombre: string;
      departamento_area?: string | null;
      agencia?: { id: number; nombre: string } | null;
    };
  };
}

export interface CreateOrdenPayload {
  numero_orden?: string;
  fecha?: string | Date | null;
  estado?: EstadoOrden;
  tipo_servicio: TipoServicio;
  prioridad: Prioridad;
  diagnostico_inicial?: string | null;
  fecha_estimada_entrega?: string | Date | null;
  especificaciones?: Record<string, unknown> | null;
  id_recepcion: number;
  id_tecnico?: number | null;
  id_equipo: number;
  id_funcionario: number;
}

export interface UpdateOrdenPayload extends Partial<CreateOrdenPayload> {}

export interface CreateInformePayload {
  tipo_informe: string;
  titulo: string;
  descripcion?: string | null;
  diagnostico_final?: string | null;
  solucion_aplicada?: string | null;
  fecha?: string | Date | null;
  archivo_ruta?: string | null;
  nueva_foto_equipo?: string | null;
  foto_opcion?: 'equipo' | 'nueva' | 'ninguna';
  user_id: number;
  orden_id: number;
  agencia_id?: number | null;
}

export interface UpdateInformePayload extends Partial<CreateInformePayload> {}

export interface DistributionCount {
  name: string;
  count: number;
  color?: string;
}

export interface OrdenMetrics {
  total: number;
  creado: number;
  en_proceso: number;
  finalizado: number;
  entregado: number;
  cancelado: number;
  conInforme: number;
  sinInforme: number;
  byPrioridad: DistributionCount[];
  byTipoServicio: DistributionCount[];
  byTecnico: { id: number; name: string; count: number }[];
}
