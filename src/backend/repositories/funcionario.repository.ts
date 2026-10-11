// src/backend/repositories/funcionario.repository.ts
// Capa de acceso a datos para Funcionarios, Sucursales, Agencias y Cargos usando Prisma
// Skill: typescript-pro, api-design-principles

import { prisma } from '@/backend/db/prisma';
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

const funcionarioInclude = {
  cargo: true,
  agencia: {
    include: {
      sucursal: true,
    },
  },
} as const;

export const funcionarioRepository = {
  // ─── FUNCIONARIOS ────────────────────────────────────────────────────────────

  async findMany(params: {
    page: number;
    pageSize: number;
    search?: string;
    sucursalId?: number;
    agenciaId?: number;
    cargoId?: number;
    estado?: boolean;
  }) {
    const { page, pageSize, search, sucursalId, agenciaId, cargoId, estado } = params;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (estado !== undefined) {
      where.estado = estado;
    }

    if (cargoId) {
      where.cargoId = cargoId;
    }

    if (agenciaId) {
      where.agenciaId = agenciaId;
    } else if (sucursalId) {
      where.agencia = {
        sucursalId: sucursalId,
      };
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { nombre: { contains: search } },
        { correo: { contains: search } },
        { telefono: { contains: search } },
        { departamento_area: { contains: search } },
      ];
    }

    const [funcionarios, totalRecords] = await Promise.all([
      prisma.funcionario.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: funcionarioInclude,
      }),
      prisma.funcionario.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      funcionarios,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages,
      },
    };
  },

  async findById(id: number) {
    return prisma.funcionario.findUnique({
      where: { id },
      include: funcionarioInclude,
    });
  },

  async create(data: CreateFuncionarioInput) {
    return prisma.funcionario.create({
      data: {
        nombre: data.nombre,
        correo: data.correo || null,
        telefono: data.telefono || null,
        departamento_area: data.departamento_area || null,
        cargoId: data.cargoId,
        agenciaId: data.agenciaId,
        estado: data.estado ?? true,
      },
      include: funcionarioInclude,
    });
  },

  async update(id: number, data: UpdateFuncionarioInput) {
    const updateData: Record<string, unknown> = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.correo !== undefined) updateData.correo = data.correo || null;
    if (data.telefono !== undefined) updateData.telefono = data.telefono || null;
    if (data.departamento_area !== undefined) updateData.departamento_area = data.departamento_area || null;
    if (data.cargoId !== undefined) updateData.cargoId = data.cargoId;
    if (data.agenciaId !== undefined) updateData.agenciaId = data.agenciaId;
    if (data.estado !== undefined) updateData.estado = data.estado;

    return prisma.funcionario.update({
      where: { id },
      data: updateData,
      include: funcionarioInclude,
    });
  },

  async delete(id: number) {
    return prisma.funcionario.delete({
      where: { id },
    });
  },

  async getMetrics() {
    const [
      total,
      active,
      inactive,
      totalSucursales,
      totalAgencias,
      totalCargos,
      sucursales,
      cargos,
    ] = await Promise.all([
      prisma.funcionario.count(),
      prisma.funcionario.count({ where: { estado: true } }),
      prisma.funcionario.count({ where: { estado: false } }),
      prisma.sucursal.count({ where: { estado: true } }),
      prisma.agencia.count({ where: { estado: true } }),
      prisma.cargo.count({ where: { estado: true } }),
      prisma.sucursal.findMany({
        select: {
          id: true,
          nombre: true,
          agencias: {
            select: {
              _count: {
                select: { funcionarios: true },
              },
            },
          },
        },
      }),
      prisma.cargo.findMany({
        select: {
          id: true,
          nombre: true,
          _count: {
            select: { funcionarios: true },
          },
        },
      }),
    ]);

    const bySucursal = sucursales.map((s) => ({
      id: s.id,
      name: s.nombre,
      count: s.agencias.reduce((acc, a) => acc + a._count.funcionarios, 0),
    }));

    const byCargo = cargos.map((c) => ({
      id: c.id,
      name: c.nombre,
      count: c._count.funcionarios,
    }));

    return {
      total,
      active,
      inactive,
      totalSucursales,
      totalAgencias,
      totalCargos,
      bySucursal,
      byCargo,
    };
  },

  // ─── SUCURSALES ──────────────────────────────────────────────────────────────

  async getSucursales() {
    return prisma.sucursal.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { agencias: true },
        },
      },
    });
  },

  async createSucursal(data: CreateSucursalInput) {
    return prisma.sucursal.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        estado: data.estado ?? true,
      },
    });
  },

  async updateSucursal(id: number, data: UpdateSucursalInput) {
    return prisma.sucursal.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.direccion !== undefined && { direccion: data.direccion || null }),
        ...(data.telefono !== undefined && { telefono: data.telefono || null }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
    });
  },

  async deleteSucursal(id: number) {
    return prisma.sucursal.delete({
      where: { id },
    });
  },

  // ─── AGENCIAS ────────────────────────────────────────────────────────────────

  async getAgencias(sucursalId?: number) {
    return prisma.agencia.findMany({
      where: sucursalId ? { sucursalId } : undefined,
      orderBy: { nombre: 'asc' },
      include: {
        sucursal: true,
        _count: {
          select: { funcionarios: true },
        },
      },
    });
  },

  async createAgencia(data: CreateAgenciaInput) {
    return prisma.agencia.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        sucursalId: data.sucursalId || null,
        estado: data.estado ?? true,
      },
      include: {
        sucursal: true,
      },
    });
  },

  async updateAgencia(id: number, data: UpdateAgenciaInput) {
    return prisma.agencia.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.direccion !== undefined && { direccion: data.direccion || null }),
        ...(data.telefono !== undefined && { telefono: data.telefono || null }),
        ...(data.sucursalId !== undefined && { sucursalId: data.sucursalId || null }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
      include: {
        sucursal: true,
      },
    });
  },

  async deleteAgencia(id: number) {
    return prisma.agencia.delete({
      where: { id },
    });
  },

  // ─── CARGOS ──────────────────────────────────────────────────────────────────

  async getCargos() {
    return prisma.cargo.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { funcionarios: true },
        },
      },
    });
  },

  async createCargo(data: CreateCargoInput) {
    return prisma.cargo.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        estado: data.estado ?? true,
      },
    });
  },

  async updateCargo(id: number, data: UpdateCargoInput) {
    return prisma.cargo.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
    });
  },

  async deleteCargo(id: number) {
    return prisma.cargo.delete({
      where: { id },
    });
  },
};
