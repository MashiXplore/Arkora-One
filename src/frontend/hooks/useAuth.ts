// src/frontend/hooks/useAuth.ts
// Hook de autenticación y sesión actual
// Skill: react-modernization

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '@/frontend/services/auth.service';

export function useAuth() {
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => authService.getMe(),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
  });

  return {
    session,
    isLoading,
    refetch,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
