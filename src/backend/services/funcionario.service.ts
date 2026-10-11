// src/backend/services/funcionario.service.ts
// Capa de lógica de negocio para Funcionarios, Sucursales, Agencias y Cargos
// Skill: api-design-principles, typescript-pro

import { funcionarioRepository } from '@/backend/repositories/funcionario.repository';
import type {
  CreateFuncionarioInput,
  UpdateFuncionarioInput,
  CreateSucursalInput,
  UpdateSucursalInput,
  CreateAgenciaInput,
  UpdateAgenciaInput,
  CreateCargoInput,
  UpdateCargoInput,
} from '@/backend/validators/funcionario.validator';

export const funcionarioService = {
  // Funcionarios
  async getFuncionarios(params: {
    page: number;
    pageSize: number;
    search?: string;
    sucursalId?: number;
    agenciaId?: number;
    cargoId?: number;
    estado?: boolean;
  }) {
    return funcionarioRepository.findMany(params);
  },

  async getFuncionarioById(id: number) {
    const funcionario = await funcionarioRepository.findById(id);
    if (!funcionario) {
      throw new Error('Funcionario no encontrado');
    }
    return funcionario;
  },

  async createFuncionario(data: CreateFuncionarioInput) {
    return funcionarioRepository.create(data);
  },

  async updateFuncionario(id: number, data: UpdateFuncionarioInput) {
    const exists = await funcionarioRepository.findById(id);
    if (!exists) {
      throw new Error('Funcionario no encontrado');
    }
    return funcionarioRepository.update(id, data);
  },

  async deleteFuncionario(id: number) {
    const exists = await funcionarioRepository.findById(id);
    if (!exists) {
      throw new Error('Funcionario no encontrado');
    }
    return funcionarioRepository.delete(id);
  },

  async getMetrics() {
    return funcionarioRepository.getMetrics();
  },

  // Sucursales
  async getSucursales() {
    return funcionarioRepository.getSucursales();
  },

  async createSucursal(data: CreateSucursalInput) {
    return funcionarioRepository.createSucursal(data);
  },

  async updateSucursal(id: number, data: UpdateSucursalInput) {
    return funcionarioRepository.updateSucursal(id, data);
  },

  async deleteSucursal(id: number) {
    return funcionarioRepository.deleteSucursal(id);
  },

  // Agencias
  async getAgencias(sucursalId?: number) {
    return funcionarioRepository.getAgencias(sucursalId);
  },

  async createAgencia(data: CreateAgenciaInput) {
    return funcionarioRepository.createAgencia(data);
  },

  async updateAgencia(id: number, data: UpdateAgenciaInput) {
    return funcionarioRepository.updateAgencia(id, data);
  },

  async deleteAgencia(id: number) {
    return funcionarioRepository.deleteAgencia(id);
  },

  // Cargos
  async getCargos() {
    return funcionarioRepository.getCargos();
  },

  async createCargo(data: CreateCargoInput) {
    return funcionarioRepository.createCargo(data);
  },

  async updateCargo(id: number, data: UpdateCargoInput) {
    return funcionarioRepository.updateCargo(id, data);
  },

  async deleteCargo(id: number) {
    return funcionarioRepository.deleteCargo(id);
  },
};
