// src/types/funcionario.types.ts
// Tipos compartidos para el módulo de Funcionarios y Estructura Organizacional
// Skill: typescript-pro

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  estado: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    agencias?: number;
  };
}

export interface CreateSucursalPayload {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  estado?: boolean;
}

export interface UpdateSucursalPayload extends Partial<CreateSucursalPayload> {}

export interface Agencia {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  especificaciones?: Record<string, unknown> | null;
  estado: boolean;
  sucursalId: number | null;
  sucursal?: Sucursal | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    funcionarios?: number;
  };
}

export interface CreateAgenciaPayload {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  especificaciones?: Record<string, unknown> | null;
  estado?: boolean;
  sucursalId?: number | null;
}

export interface UpdateAgenciaPayload extends Partial<CreateAgenciaPayload> {}

export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string | null;
  especificaciones?: Record<string, unknown> | null;
  estado: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    funcionarios?: number;
  };
}

export interface CreateCargoPayload {
  nombre: string;
  descripcion?: string | null;
  especificaciones?: Record<string, unknown> | null;
  estado?: boolean;
}

export interface UpdateCargoPayload extends Partial<CreateCargoPayload> {}

export interface Funcionario {
  id: number;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  departamento_area: string | null;
  estado: boolean;
  cargoId: number;
  agenciaId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FuncionarioWithRelations extends Funcionario {
  cargo: Cargo;
  agencia: Agencia & {
    sucursal?: Sucursal | null;
  };
}

export interface CreateFuncionarioPayload {
  nombre: string;
  correo?: string | null;
  telefono?: string | null;
  departamento_area?: string | null;
  cargoId: number;
  agenciaId: number;
  estado?: boolean;
}

export interface UpdateFuncionarioPayload extends Partial<CreateFuncionarioPayload> {}

export interface FuncionarioMetricsDistribution {
  id: number;
  name: string;
  count: number;
}

export interface FuncionarioMetrics {
  total: number;
  active: number;
  inactive: number;
  totalSucursales: number;
  totalAgencias: number;
  totalCargos: number;
  bySucursal: FuncionarioMetricsDistribution[];
  byCargo: FuncionarioMetricsDistribution[];
}
