// src/frontend/hooks/useUsers.ts
// Custom Hook con TanStack Query para el módulo de usuarios
// Skill: react-modernization

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/frontend/services/user.service';
import type { CreateUserPayload, UpdateUserPayload } from '@/types/user.types';

export const USERS_QUERY_KEY = 'users';

/** Hook para obtener la lista paginada de usuarios */
export function useUsers(params: { page?: number; pageSize?: number; search?: string } = {}) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => userService.getAll(params),
  });
}

/** Hook para obtener las métricas de usuarios */
export function useUserMetrics() {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'metrics'],
    queryFn: () => userService.getMetrics(),
  });
}

/** Hook para crear un usuario */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

/** Hook para actualizar un usuario */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

/** Hook para eliminar un usuario */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}
