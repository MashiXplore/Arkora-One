// src/frontend/hooks/useRoles.ts
// Hook para obtener la lista de roles del sistema
// Skill: react-modernization

'use client';

import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/frontend/services/role.service';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles(),
  });
}
