// src/frontend/services/equipo.service.ts
// Capa de servicio frontend para Equipos, Marcas, Tipos de Equipo y Modelos
// Skill: react-modernization — NUNCA hacer fetch dentro de componentes visuales

import type { ApiListResponse, ApiResponse } from '@/types/api.types';
import type {
  EquipoWithRelations,
  CreateEquipoPayload,
  UpdateEquipoPayload,
  EquipoMetrics,
  Marca,
  CreateMarcaPayload,
  UpdateMarcaPayload,
  TipoEquipo,
  CreateTipoEquipoPayload,
  UpdateTipoEquipoPayload,
  Modelo,
  CreateModeloPayload,
  UpdateModeloPayload,
  EstadoOperativoType,
} from '@/types/equipo.types';

const BASE = '/api/v1/equipos';

export const equipoService = {
  // ─── EQUIPOS ─────────────────────────────────────────────────────────────────

  async getAll(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      marcaId?: number;
      tipoEquipoId?: number;
      modeloId?: number;
      funcionarioId?: number;
      estadoOperativo?: EstadoOperativoType;
    } = {}
  ): Promise<ApiListResponse<EquipoWithRelations>> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
      ...(params.search ? { search: params.search } : {}),
      ...(params.marcaId ? { marcaId: String(params.marcaId) } : {}),
      ...(params.tipoEquipoId ? { tipoEquipoId: String(params.tipoEquipoId) } : {}),
      ...(params.modeloId ? { modeloId: String(params.modeloId) } : {}),
      ...(params.funcionarioId !== undefined ? { funcionarioId: String(params.funcionarioId) } : {}),
      ...(params.estadoOperativo ? { estadoOperativo: params.estadoOperativo } : {}),
    });
    const res = await fetch(`${BASE}?${query}`);
    return res.json();
  },

  async create(data: CreateEquipoPayload): Promise<ApiResponse<EquipoWithRelations>> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: number, data: UpdateEquipoPayload): Promise<ApiResponse<EquipoWithRelations>> {
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

  async getMetrics(): Promise<ApiResponse<EquipoMetrics>> {
    const res = await fetch(`${BASE}/metrics`);
    return res.json();
  },

  // ─── MARCAS ──────────────────────────────────────────────────────────────────

  async getMarcas(): Promise<ApiResponse<Marca[]>> {
    const res = await fetch(`${BASE}/marcas`);
    return res.json();
  },

  async createMarca(data: CreateMarcaPayload): Promise<ApiResponse<Marca>> {
    const res = await fetch(`${BASE}/marcas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateMarca(id: number, data: UpdateMarcaPayload): Promise<ApiResponse<Marca>> {
    const res = await fetch(`${BASE}/marcas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteMarca(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/marcas/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // ─── TIPOS DE EQUIPO ─────────────────────────────────────────────────────────

  async getTipos(marcaId?: number): Promise<ApiResponse<TipoEquipo[]>> {
    const query = marcaId ? `?marcaId=${marcaId}` : '';
    const res = await fetch(`${BASE}/tipos${query}`);
    return res.json();
  },

  async createTipo(data: CreateTipoEquipoPayload): Promise<ApiResponse<TipoEquipo>> {
    const res = await fetch(`${BASE}/tipos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTipo(id: number, data: UpdateTipoEquipoPayload): Promise<ApiResponse<TipoEquipo>> {
    const res = await fetch(`${BASE}/tipos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteTipo(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/tipos/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // ─── MODELOS ─────────────────────────────────────────────────────────────────

  async getModelos(params?: { marcaId?: number; tipoEquipoId?: number }): Promise<ApiResponse<Modelo[]>> {
    const query = new URLSearchParams({
      ...(params?.marcaId ? { marcaId: String(params.marcaId) } : {}),
      ...(params?.tipoEquipoId ? { tipoEquipoId: String(params.tipoEquipoId) } : {}),
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${BASE}/modelos${queryString}`);
    return res.json();
  },

  async createModelo(data: CreateModeloPayload): Promise<ApiResponse<Modelo>> {
    const res = await fetch(`${BASE}/modelos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateModelo(id: number, data: UpdateModeloPayload): Promise<ApiResponse<Modelo>> {
    const res = await fetch(`${BASE}/modelos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteModelo(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/modelos/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
