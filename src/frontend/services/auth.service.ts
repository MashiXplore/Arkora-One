// src/frontend/services/auth.service.ts
// Servicio frontend para operaciones de Autenticación
// Skill: typescript-pro, react-modernization

import type { ApiResponse } from '@/types/api.types';
import type { AuthSession } from '@/types/user.types';
import type { LoginInput } from '@/backend/validators/user.validator';

export const authService = {
  /** Inicia sesión */
  async login(credentials: LoginInput): Promise<ApiResponse<AuthSession>> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    return res.json();
  },

  /** Cierra la sesión activa */
  async logout(): Promise<void> {
    const res = await fetch('/api/v1/auth/logout', { method: 'POST' });
    const json: ApiResponse<null> = await res.json();
    if (!json.success) {
      throw new Error(json.error.message);
    }
    window.location.href = '/login';
  },

  /** Obtiene la sesión actual */
  async getMe(): Promise<AuthSession | null> {
    const res = await fetch('/api/v1/auth/me');
    if (!res.ok) return null;
    const json: ApiResponse<AuthSession> = await res.json();
    if (!json.success) return null;
    return json.data;
  },
};
