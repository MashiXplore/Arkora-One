// src/frontend/hooks/usePermissions.ts
// Hooks para gestión de la matriz de permisos RBAC
// Skill: react-modernization

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/frontend/services/role.service';
import type { UpdatePermissionPayload } from '@/types/role.types';
import { USERS_QUERY_KEY } from './useUsers';

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.getPermissions(),
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePermissionPayload) => roleService.updatePermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
}

export function useSeedDemoUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => roleService.seedDemoUsers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
