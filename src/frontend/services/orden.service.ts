// src/frontend/services/orden.service.ts
// Capa de servicio frontend para Órdenes de Servicio e Informes Técnicos
// Skill: react-modernization — NUNCA hacer fetch dentro de componentes visuales

import type { ApiListResponse, ApiResponse } from '@/types/api.types';
import type {
  OrdenWithRelations,
  CreateOrdenPayload,
  UpdateOrdenPayload,
  OrdenMetrics,
  InformeWithRelations,
  CreateInformePayload,
  UpdateInformePayload,
  EstadoOrden,
  TipoServicio,
  Prioridad,
} from '@/types/orden.types';

const BASE_ORDENES = '/api/v1/ordenes';
const BASE_INFORMES = '/api/v1/informes';

export const ordenService = {
  // ─── ÓRDENES ─────────────────────────────────────────────────────────────────

  async getAll(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      estado?: EstadoOrden;
      tipo_servicio?: TipoServicio;
      prioridad?: Prioridad;
      id_tecnico?: number;
      id_funcionario?: number;
      id_equipo?: number;
    } = {}
  ): Promise<ApiListResponse<OrdenWithRelations>> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
      ...(params.search ? { search: params.search } : {}),
      ...(params.estado ? { estado: params.estado } : {}),
      ...(params.tipo_servicio ? { tipo_servicio: params.tipo_servicio } : {}),
      ...(params.prioridad ? { prioridad: params.prioridad } : {}),
      ...(params.id_tecnico !== undefined ? { id_tecnico: String(params.id_tecnico) } : {}),
      ...(params.id_funcionario !== undefined ? { id_funcionario: String(params.id_funcionario) } : {}),
      ...(params.id_equipo !== undefined ? { id_equipo: String(params.id_equipo) } : {}),
    });
    const res = await fetch(`${BASE_ORDENES}?${query}`);
    return res.json();
  },

  async getById(id: number): Promise<ApiResponse<OrdenWithRelations>> {
    const res = await fetch(`${BASE_ORDENES}/${id}`);
    return res.json();
  },

  async create(data: CreateOrdenPayload): Promise<ApiResponse<OrdenWithRelations>> {
    const res = await fetch(BASE_ORDENES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: number, data: UpdateOrdenPayload): Promise<ApiResponse<OrdenWithRelations>> {
    const res = await fetch(`${BASE_ORDENES}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE_ORDENES}/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getMetrics(): Promise<ApiResponse<OrdenMetrics>> {
    const res = await fetch(`${BASE_ORDENES}/metrics`);
    return res.json();
  },

  // ─── INFORMES ────────────────────────────────────────────────────────────────

  async getInformes(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      tecnicoId?: number;
      agenciaId?: number;
      ordenId?: number;
    } = {}
  ): Promise<ApiListResponse<InformeWithRelations>> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
      ...(params.search ? { search: params.search } : {}),
      ...(params.tecnicoId ? { tecnicoId: String(params.tecnicoId) } : {}),
      ...(params.agenciaId ? { agenciaId: String(params.agenciaId) } : {}),
      ...(params.ordenId ? { ordenId: String(params.ordenId) } : {}),
    });
    const res = await fetch(`${BASE_INFORMES}?${query}`);
    return res.json();
  },

  async getInformeById(id: number): Promise<ApiResponse<InformeWithRelations>> {
    const res = await fetch(`${BASE_INFORMES}/${id}`);
    return res.json();
  },

  async createInforme(data: CreateInformePayload): Promise<ApiResponse<InformeWithRelations>> {
    const res = await fetch(BASE_INFORMES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateInforme(id: number, data: UpdateInformePayload): Promise<ApiResponse<InformeWithRelations>> {
    const res = await fetch(`${BASE_INFORMES}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteInforme(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE_INFORMES}/${id}`, { method: 'DELETE' });
    return res.json();
  },
};
