// src/backend/services/orden.service.ts
// Capa de lógica de negocio para Órdenes de Servicio e Informes Técnicos
// Skill: api-design-principles, typescript-pro

import { ordenRepository, informeRepository } from '@/backend/repositories/orden.repository';
import { prisma } from '@/backend/db/prisma';
import type {
  CreateOrdenInput,
  UpdateOrdenInput,
  CreateInformeInput,
  UpdateInformeInput,
} from '@/backend/validators/orden.validator';
import type { EstadoOrden, TipoServicio, Prioridad } from '@prisma/client';

export const ordenService = {
  // ─── ÓRDENES ─────────────────────────────────────────────────────────────────

  async getOrdenes(params: {
    page: number;
    pageSize: number;
    search?: string;
    estado?: EstadoOrden;
    tipo_servicio?: TipoServicio;
    prioridad?: Prioridad;
    id_tecnico?: number;
    id_funcionario?: number;
    id_equipo?: number;
  }) {
    return ordenRepository.findMany(params);
  },

  async getOrdenById(id: number) {
    const orden = await ordenRepository.findById(id);
    if (!orden) {
      throw new Error('Orden de servicio no encontrada');
    }
    return orden;
  },

  async createOrden(data: CreateOrdenInput) {
    const orden = await ordenRepository.create(data);

    // Si la orden entra en reparación o mantenimiento, actualizar estado del equipo a en_mantenimiento
    if (data.id_equipo && (data.estado === 'creado' || data.estado === 'en_proceso')) {
      await prisma.equipo.update({
        where: { id: data.id_equipo },
        data: { estado_operativo: 'en_mantenimiento' },
      }).catch(() => {
        // Ignorar si ya está en mantenimiento
      });
    }

    return orden;
  },

  async updateOrden(id: number, data: UpdateOrdenInput) {
    const exists = await ordenRepository.findById(id);
    if (!exists) {
      throw new Error('Orden de servicio no encontrada');
    }

    const updated = await ordenRepository.update(id, data);

    // Si la orden finaliza o se entrega, restaurar el equipo a operativo
    if (data.estado === 'finalizado' || data.estado === 'entregado') {
      const equipoId = data.id_equipo || exists.id_equipo;
      await prisma.equipo.update({
        where: { id: equipoId },
        data: { estado_operativo: 'operativo' },
      }).catch(() => {
        // Ignorar error si el equipo fue modificado
      });
    }

    return updated;
  },

  async deleteOrden(id: number) {
    const exists = await ordenRepository.findById(id);
    if (!exists) {
      throw new Error('Orden de servicio no encontrada');
    }
    return ordenRepository.delete(id);
  },

  async getOrdenMetrics() {
    return ordenRepository.getMetrics();
  },

  // ─── INFORMES ────────────────────────────────────────────────────────────────

  async getInformes(params: {
    page: number;
    pageSize: number;
    search?: string;
    tecnicoId?: number;
    agenciaId?: number;
    ordenId?: number;
  }) {
    return informeRepository.findMany(params);
  },

  async getInformeById(id: number) {
    const informe = await informeRepository.findById(id);
    if (!informe) {
      throw new Error('Informe técnico no encontrado');
    }
    return informe;
  },

  async getInformeByOrdenId(ordenId: number) {
    return informeRepository.findByOrdenId(ordenId);
  },

  async createInforme(data: CreateInformeInput) {
    // Verificar si la orden ya tiene informe
    const existingInforme = await informeRepository.findByOrdenId(data.orden_id);
    if (existingInforme) {
      throw new Error('La orden ya cuenta con un informe técnico emitido');
    }

    const informe = await informeRepository.create(data);

    // Al emitir informe técnico, actualizar el estado de la orden a finalizado si está en proceso o creada
    await prisma.orden.update({
      where: { id: data.orden_id },
      data: { estado: 'finalizado' },
    }).catch(() => {});

    return informe;
  },

  async updateInforme(id: number, data: UpdateInformeInput) {
    const exists = await informeRepository.findById(id);
    if (!exists) {
      throw new Error('Informe técnico no encontrado');
    }
    return informeRepository.update(id, data);
  },

  async deleteInforme(id: number) {
    const exists = await informeRepository.findById(id);
    if (!exists) {
      throw new Error('Informe técnico no encontrado');
    }
    return informeRepository.delete(id);
  },

  async getInformeMetrics() {
    return informeRepository.getMetrics();
  },
};
