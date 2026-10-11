// src/frontend/services/funcionario.service.ts
// Capa de servicio frontend para Funcionarios, Sucursales, Agencias y Cargos
// Skill: react-modernization — NUNCA hacer fetch dentro de componentes visuales

import type { ApiListResponse, ApiResponse } from '@/types/api.types';
import type {
  FuncionarioWithRelations,
  CreateFuncionarioPayload,
  UpdateFuncionarioPayload,
  FuncionarioMetrics,
  Sucursal,
  CreateSucursalPayload,
  UpdateSucursalPayload,
  Agencia,
  CreateAgenciaPayload,
  UpdateAgenciaPayload,
  Cargo,
  CreateCargoPayload,
  UpdateCargoPayload,
} from '@/types/funcionario.types';

const BASE = '/api/v1/funcionarios';

export const funcionarioService = {
  // ─── FUNCIONARIOS ────────────────────────────────────────────────────────────

  async getAll(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      sucursalId?: number;
      agenciaId?: number;
      cargoId?: number;
      estado?: boolean;
    } = {}
  ): Promise<ApiListResponse<FuncionarioWithRelations>> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
      ...(params.search ? { search: params.search } : {}),
      ...(params.sucursalId ? { sucursalId: String(params.sucursalId) } : {}),
      ...(params.agenciaId ? { agenciaId: String(params.agenciaId) } : {}),
      ...(params.cargoId ? { cargoId: String(params.cargoId) } : {}),
      ...(params.estado !== undefined ? { estado: String(params.estado) } : {}),
    });
    const res = await fetch(`${BASE}?${query}`);
    return res.json();
  },

  async create(data: CreateFuncionarioPayload): Promise<ApiResponse<FuncionarioWithRelations>> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: number, data: UpdateFuncionarioPayload): Promise<ApiResponse<FuncionarioWithRelations>> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getMetrics(): Promise<ApiResponse<FuncionarioMetrics>> {
    const res = await fetch(`${BASE}/metrics`);
    return res.json();
  },

  // ─── SUCURSALES ──────────────────────────────────────────────────────────────

  async getSucursales(): Promise<ApiResponse<Sucursal[]>> {
    const res = await fetch(`${BASE}/sucursales`);
    return res.json();
  },

  async createSucursal(data: CreateSucursalPayload): Promise<ApiResponse<Sucursal>> {
    const res = await fetch(`${BASE}/sucursales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateSucursal(id: number, data: UpdateSucursalPayload): Promise<ApiResponse<Sucursal>> {
    const res = await fetch(`${BASE}/sucursales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteSucursal(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/sucursales/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // ─── AGENCIAS ────────────────────────────────────────────────────────────────

  async getAgencias(sucursalId?: number): Promise<ApiResponse<Agencia[]>> {
    const query = sucursalId ? `?sucursalId=${sucursalId}` : '';
    const res = await fetch(`${BASE}/agencias${query}`);
    return res.json();
  },

  async createAgencia(data: CreateAgenciaPayload): Promise<ApiResponse<Agencia>> {
    const res = await fetch(`${BASE}/agencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAgencia(id: number, data: UpdateAgenciaPayload): Promise<ApiResponse<Agencia>> {
    const res = await fetch(`${BASE}/agencias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAgencia(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/agencias/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // ─── CARGOS ──────────────────────────────────────────────────────────────────

  async getCargos(): Promise<ApiResponse<Cargo[]>> {
    const res = await fetch(`${BASE}/cargos`);
    return res.json();
  },

  async createCargo(data: CreateCargoPayload): Promise<ApiResponse<Cargo>> {
    const res = await fetch(`${BASE}/cargos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCargo(id: number, data: UpdateCargoPayload): Promise<ApiResponse<Cargo>> {
    const res = await fetch(`${BASE}/cargos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCargo(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/cargos/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
