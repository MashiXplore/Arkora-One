// src/frontend/hooks/useOrdenes.ts
// Custom Hooks con TanStack Query para Órdenes de Servicio e Informes Técnicos
// Skill: react-modernization

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordenService } from '@/frontend/services/orden.service';
import type {
  CreateOrdenPayload,
  UpdateOrdenPayload,
  CreateInformePayload,
  UpdateInformePayload,
  EstadoOrden,
  TipoServicio,
  Prioridad,
} from '@/types/orden.types';

export const ORDENES_QUERY_KEY = 'ordenes';
export const INFORMES_QUERY_KEY = 'informes';

// ─── ÓRDENES DE SERVICIO ───────────────────────────────────────────────────────

export function useOrdenes(
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
) {
  return useQuery({
    queryKey: [ORDENES_QUERY_KEY, params],
    queryFn: () => ordenService.getAll(params),
  });
}

export function useOrden(id: number) {
  return useQuery({
    queryKey: [ORDENES_QUERY_KEY, id],
    queryFn: () => ordenService.getById(id),
    enabled: Boolean(id),
  });
}

export function useOrdenMetrics() {
  return useQuery({
    queryKey: [ORDENES_QUERY_KEY, 'metrics'],
    queryFn: () => ordenService.getMetrics(),
  });
}

export function useCreateOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrdenPayload) => ordenService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDENES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

export function useUpdateOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrdenPayload }) =>
      ordenService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDENES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

export function useDeleteOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordenService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDENES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INFORMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

// ─── INFORMES TÉCNICOS ────────────────────────────────────────────────────────

export function useInformes(
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    tecnicoId?: number;
    agenciaId?: number;
    ordenId?: number;
  } = {}
) {
  return useQuery({
    queryKey: [INFORMES_QUERY_KEY, params],
    queryFn: () => ordenService.getInformes(params),
  });
}

export function useInforme(id: number) {
  return useQuery({
    queryKey: [INFORMES_QUERY_KEY, id],
    queryFn: () => ordenService.getInformeById(id),
    enabled: Boolean(id),
  });
}

export function useCreateInforme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInformePayload) => ordenService.createInforme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INFORMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDENES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

export function useUpdateInforme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInformePayload }) =>
      ordenService.updateInforme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INFORMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDENES_QUERY_KEY] });
    },
  });
}

export function useDeleteInforme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordenService.deleteInforme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INFORMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDENES_QUERY_KEY] });
    },
  });
}
