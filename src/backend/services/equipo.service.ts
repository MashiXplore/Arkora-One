// src/backend/services/equipo.service.ts
// Capa de lógica de negocio para Equipos, Marcas, Tipos de Equipo y Modelos
// Skill: api-design-principles, typescript-pro

import { equipoRepository } from '@/backend/repositories/equipo.repository';
import type {
  CreateEquipoInput,
  UpdateEquipoInput,
  CreateMarcaInput,
  UpdateMarcaInput,
  CreateTipoEquipoInput,
  UpdateTipoEquipoInput,
  CreateModeloInput,
  UpdateModeloInput,
} from '@/backend/validators/equipo.validator';
import type { EstadoOperativo } from '@prisma/client';

export const equipoService = {
  // Equipos
  async getEquipos(params: {
    page: number;
    pageSize: number;
    search?: string;
    marcaId?: number;
    tipoEquipoId?: number;
    modeloId?: number;
    funcionarioId?: number;
    estadoOperativo?: EstadoOperativo;
  }) {
    return equipoRepository.findMany(params);
  },

  async getEquipoById(id: number) {
    const equipo = await equipoRepository.findById(id);
    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }
    return equipo;
  },

  async createEquipo(data: CreateEquipoInput) {
    const existing = await equipoRepository.findByEtiqueta(data.numero_etiqueta.trim());
    if (existing) {
      throw new Error(`El código de etiqueta / activo "${data.numero_etiqueta}" ya está registrado en el sistema. Debe ser único.`);
    }
    return equipoRepository.create(data);
  },

  async updateEquipo(id: number, data: UpdateEquipoInput) {
    const exists = await equipoRepository.findById(id);
    if (!exists) {
      throw new Error('Equipo no encontrado');
    }
    if (data.numero_etiqueta && data.numero_etiqueta.trim() !== exists.numero_etiqueta) {
      const duplicate = await equipoRepository.findByEtiqueta(data.numero_etiqueta.trim());
      if (duplicate && duplicate.id !== id) {
        throw new Error(`El código de etiqueta "${data.numero_etiqueta}" ya está en uso por otro equipo.`);
      }
    }
    return equipoRepository.update(id, data);
  },

  async deleteEquipo(id: number) {
    const exists = await equipoRepository.findById(id);
    if (!exists) {
      throw new Error('Equipo no encontrado');
    }
    return equipoRepository.delete(id);
  },

  async getMetrics() {
    return equipoRepository.getMetrics();
  },

  // Marcas
  async getMarcas() {
    return equipoRepository.getMarcas();
  },

  async createMarca(data: CreateMarcaInput) {
    return equipoRepository.createMarca(data);
  },

  async updateMarca(id: number, data: UpdateMarcaInput) {
    return equipoRepository.updateMarca(id, data);
  },

  async deleteMarca(id: number) {
    return equipoRepository.deleteMarca(id);
  },

  // Tipos de Equipo
  async getTiposEquipo(marcaId?: number) {
    return equipoRepository.getTiposEquipo(marcaId);
  },

  async createTipoEquipo(data: CreateTipoEquipoInput) {
    return equipoRepository.createTipoEquipo(data);
  },

  async updateTipoEquipo(id: number, data: UpdateTipoEquipoInput) {
    return equipoRepository.updateTipoEquipo(id, data);
  },

  async deleteTipoEquipo(id: number) {
    return equipoRepository.deleteTipoEquipo(id);
  },

  // Modelos
  async getModelos(params?: { marcaId?: number; tipoEquipoId?: number }) {
    return equipoRepository.getModelos(params);
  },

  async createModelo(data: CreateModeloInput) {
    return equipoRepository.createModelo(data);
  },

  async updateModelo(id: number, data: UpdateModeloInput) {
    return equipoRepository.updateModelo(id, data);
  },

  async deleteModelo(id: number) {
    return equipoRepository.deleteModelo(id);
  },
};
