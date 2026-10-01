// src/frontend/services/user.service.ts
// Capa de servicio: todas las llamadas HTTP al backend para el módulo de usuarios
// Skill: react-modernization — NUNCA hacer fetch dentro de componentes visuales

import type { ApiListResponse, ApiResponse } from '@/types/api.types';
import type { UserDTO, CreateUserPayload, UpdateUserPayload } from '@/types/user.types';

const BASE = '/api/v1/users';

export const userService = {
  /** Obtiene lista paginada de usuarios */
  async getAll(params: { page?: number; pageSize?: number; search?: string } = {}): Promise<ApiListResponse<UserDTO>> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
      ...(params.search ? { search: params.search } : {}),
    });
    const res = await fetch(`${BASE}?${query}`);
    return res.json();
  },

  /** Crea un nuevo usuario */
  async create(data: CreateUserPayload): Promise<ApiResponse<UserDTO>> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /** Actualiza un usuario existente */
  async update(id: number, data: UpdateUserPayload): Promise<ApiResponse<UserDTO>> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /** Elimina un usuario */
  async delete(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  /** Obtiene métricas del módulo */
  async getMetrics(): Promise<ApiResponse<{ total: number; active: number; inactive: number }>> {
    const res = await fetch(`${BASE}/metrics`);
    return res.json();
  },
};
