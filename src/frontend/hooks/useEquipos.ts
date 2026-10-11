// src/frontend/hooks/useEquipos.ts
// Custom Hooks con TanStack Query para Equipos, Marcas, Tipos y Modelos
// Skill: react-modernization

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoService } from '@/frontend/services/equipo.service';
import type {
  CreateEquipoPayload,
  UpdateEquipoPayload,
  CreateMarcaPayload,
  UpdateMarcaPayload,
  CreateTipoEquipoPayload,
  UpdateTipoEquipoPayload,
  CreateModeloPayload,
  UpdateModeloPayload,
  EstadoOperativoType,
} from '@/types/equipo.types';

export const EQUIPOS_QUERY_KEY = 'equipos';
export const MARCAS_QUERY_KEY = 'marcas';
export const TIPOS_EQUIPO_QUERY_KEY = 'tipos_equipo';
export const MODELOS_QUERY_KEY = 'modelos';

// ─── EQUIPOS ─────────────────────────────────────────────────────────────────

export function useEquipos(
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
) {
  return useQuery({
    queryKey: [EQUIPOS_QUERY_KEY, params],
    queryFn: () => equipoService.getAll(params),
  });
}

export function useEquipoMetrics() {
  return useQuery({
    queryKey: [EQUIPOS_QUERY_KEY, 'metrics'],
    queryFn: () => equipoService.getMetrics(),
  });
}

export function useCreateEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEquipoPayload) => equipoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TIPOS_EQUIPO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MODELOS_QUERY_KEY] });
    },
  });
}

export function useUpdateEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEquipoPayload }) =>
      equipoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TIPOS_EQUIPO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MODELOS_QUERY_KEY] });
    },
  });
}

export function useDeleteEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TIPOS_EQUIPO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MODELOS_QUERY_KEY] });
    },
  });
}

// ─── MARCAS ──────────────────────────────────────────────────────────────────

export function useMarcas() {
  return useQuery({
    queryKey: [MARCAS_QUERY_KEY],
    queryFn: () => equipoService.getMarcas(),
  });
}

export function useCreateMarca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarcaPayload) => equipoService.createMarca(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

export function useUpdateMarca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMarcaPayload }) =>
      equipoService.updateMarca(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

export function useDeleteMarca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipoService.deleteMarca(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

// ─── TIPOS DE EQUIPO ─────────────────────────────────────────────────────────

export function useTiposEquipo(marcaId?: number) {
  return useQuery({
    queryKey: [TIPOS_EQUIPO_QUERY_KEY, marcaId],
    queryFn: () => equipoService.getTipos(marcaId),
  });
}

export function useCreateTipoEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTipoEquipoPayload) => equipoService.createTipo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_EQUIPO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

export function useUpdateTipoEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTipoEquipoPayload }) =>
      equipoService.updateTipo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_EQUIPO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

export function useDeleteTipoEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipoService.deleteTipo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_EQUIPO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

// ─── MODELOS ─────────────────────────────────────────────────────────────────

export function useModelos(params?: { marcaId?: number; tipoEquipoId?: number }) {
  return useQuery({
    queryKey: [MODELOS_QUERY_KEY, params],
    queryFn: () => equipoService.getModelos(params),
  });
}

export function useCreateModelo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModeloPayload) => equipoService.createModelo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODELOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MARCAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TIPOS_EQUIPO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

export function useUpdateModelo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateModeloPayload }) =>
      equipoService.updateModelo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODELOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}

export function useDeleteModelo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipoService.deleteModelo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODELOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EQUIPOS_QUERY_KEY] });
    },
  });
}
