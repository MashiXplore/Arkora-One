// src/frontend/hooks/useFuncionarios.ts
// Custom Hooks con TanStack Query para Funcionarios, Sucursales, Agencias y Cargos
// Skill: react-modernization

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { funcionarioService } from '@/frontend/services/funcionario.service';
import type {
  CreateFuncionarioPayload,
  UpdateFuncionarioPayload,
  CreateSucursalPayload,
  UpdateSucursalPayload,
  CreateAgenciaPayload,
  UpdateAgenciaPayload,
  CreateCargoPayload,
  UpdateCargoPayload,
} from '@/types/funcionario.types';

export const FUNCIONARIOS_QUERY_KEY = 'funcionarios';
export const SUCURSALES_QUERY_KEY = 'sucursales';
export const AGENCIAS_QUERY_KEY = 'agencias';
export const CARGOS_QUERY_KEY = 'cargos';

// ─── FUNCIONARIOS ────────────────────────────────────────────────────────────

export function useFuncionarios(
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sucursalId?: number;
    agenciaId?: number;
    cargoId?: number;
    estado?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: [FUNCIONARIOS_QUERY_KEY, params],
    queryFn: () => funcionarioService.getAll(params),
  });
}

export function useFuncionarioMetrics() {
  return useQuery({
    queryKey: [FUNCIONARIOS_QUERY_KEY, 'metrics'],
    queryFn: () => funcionarioService.getMetrics(),
  });
}

export function useCreateFuncionario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFuncionarioPayload) => funcionarioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENCIAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CARGOS_QUERY_KEY] });
    },
  });
}

export function useUpdateFuncionario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFuncionarioPayload }) =>
      funcionarioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENCIAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CARGOS_QUERY_KEY] });
    },
  });
}

export function useDeleteFuncionario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => funcionarioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENCIAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CARGOS_QUERY_KEY] });
    },
  });
}

// ─── SUCURSALES ──────────────────────────────────────────────────────────────

export function useSucursales() {
  return useQuery({
    queryKey: [SUCURSALES_QUERY_KEY],
    queryFn: () => funcionarioService.getSucursales(),
  });
}

export function useCreateSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSucursalPayload) => funcionarioService.createSucursal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUCURSALES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

export function useUpdateSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSucursalPayload }) =>
      funcionarioService.updateSucursal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUCURSALES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

export function useDeleteSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => funcionarioService.deleteSucursal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUCURSALES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

// ─── AGENCIAS ────────────────────────────────────────────────────────────────

export function useAgencias(sucursalId?: number) {
  return useQuery({
    queryKey: [AGENCIAS_QUERY_KEY, sucursalId],
    queryFn: () => funcionarioService.getAgencias(sucursalId),
  });
}

export function useCreateAgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgenciaPayload) => funcionarioService.createAgencia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENCIAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUCURSALES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

export function useUpdateAgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAgenciaPayload }) =>
      funcionarioService.updateAgencia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENCIAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUCURSALES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

export function useDeleteAgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => funcionarioService.deleteAgencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENCIAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUCURSALES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

// ─── CARGOS ──────────────────────────────────────────────────────────────────

export function useCargos() {
  return useQuery({
    queryKey: [CARGOS_QUERY_KEY],
    queryFn: () => funcionarioService.getCargos(),
  });
}

export function useCreateCargo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCargoPayload) => funcionarioService.createCargo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARGOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

export function useUpdateCargo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCargoPayload }) =>
      funcionarioService.updateCargo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARGOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}

export function useDeleteCargo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => funcionarioService.deleteCargo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARGOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FUNCIONARIOS_QUERY_KEY] });
    },
  });
}
