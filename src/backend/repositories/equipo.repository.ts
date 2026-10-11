// src/backend/repositories/equipo.repository.ts
// Capa de acceso a datos para Equipos, Marcas, Tipos de Equipo y Modelos usando Prisma
// Skill: typescript-pro, api-design-principles

import { prisma } from '@/backend/db/prisma';
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

const equipoInclude = {
  marca: true,
  tipo_equipo: true,
  modelo: true,
  funcionario: {
    include: {
      agencia: {
        include: {
          sucursal: true,
        },
      },
    },
  },
} as const;

export const equipoRepository = {
  // ─── EQUIPOS ─────────────────────────────────────────────────────────────────

  async findMany(params: {
    page: number;
    pageSize: number;
    search?: string;
    marcaId?: number;
    tipoEquipoId?: number;
    modeloId?: number;
    funcionarioId?: number;
    estadoOperativo?: EstadoOperativo;
  }) {
    const { page, pageSize, search, marcaId, tipoEquipoId, modeloId, funcionarioId, estadoOperativo } = params;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (estadoOperativo) {
      where.estado_operativo = estadoOperativo;
    }

    if (marcaId) {
      where.marca_id = marcaId;
    }

    if (tipoEquipoId) {
      where.tipo_equipo_id = tipoEquipoId;
    }

    if (modeloId) {
      where.modelo_id = modeloId;
    }

    if (funcionarioId !== undefined) {
      where.funcionario_id = funcionarioId;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { numero_etiqueta: { contains: search } },
        { numero_serie: { contains: search } },
        { observaciones: { contains: search } },
        { funcionario: { nombre: { contains: search } } },
      ];
    }

    const [equipos, totalRecords] = await Promise.all([
      prisma.equipo.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: equipoInclude,
      }),
      prisma.equipo.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      equipos,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages,
      },
    };
  },

  async findById(id: number) {
    return prisma.equipo.findUnique({
      where: { id },
      include: equipoInclude,
    });
  },

  async findByEtiqueta(numero_etiqueta: string) {
    return prisma.equipo.findUnique({
      where: { numero_etiqueta },
      include: equipoInclude,
    });
  },

  async create(data: CreateEquipoInput) {
    return prisma.equipo.create({
      data: {
        numero_etiqueta: data.numero_etiqueta,
        numero_serie: data.numero_serie || null,
        fecha_ingreso: data.fecha_ingreso ? new Date(data.fecha_ingreso) : null,
        observaciones: data.observaciones || null,
        imagen: data.imagen || null,
        estado_operativo: (data.estado_operativo as EstadoOperativo) ?? 'operativo',
        tipo_equipo_id: data.tipo_equipo_id,
        marca_id: data.marca_id,
        modelo_id: data.modelo_id,
        funcionario_id: data.funcionario_id || null,
      },
      include: equipoInclude,
    });
  },

  async update(id: number, data: UpdateEquipoInput) {
    const updateData: Record<string, unknown> = {};
    if (data.numero_etiqueta !== undefined) updateData.numero_etiqueta = data.numero_etiqueta;
    if (data.numero_serie !== undefined) updateData.numero_serie = data.numero_serie || null;
    if (data.fecha_ingreso !== undefined) {
      updateData.fecha_ingreso = data.fecha_ingreso ? new Date(data.fecha_ingreso) : null;
    }
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;
    if (data.imagen !== undefined) updateData.imagen = data.imagen || null;
    if (data.estado_operativo !== undefined) updateData.estado_operativo = data.estado_operativo as EstadoOperativo;
    if (data.tipo_equipo_id !== undefined) updateData.tipo_equipo_id = data.tipo_equipo_id;
    if (data.marca_id !== undefined) updateData.marca_id = data.marca_id;
    if (data.modelo_id !== undefined) updateData.modelo_id = data.modelo_id;
    if (data.funcionario_id !== undefined) updateData.funcionario_id = data.funcionario_id || null;

    return prisma.equipo.update({
      where: { id },
      data: updateData,
      include: equipoInclude,
    });
  },

  async delete(id: number) {
    return prisma.equipo.delete({
      where: { id },
    });
  },

  async getMetrics() {
    const [
      total,
      operativo,
      en_mantenimiento,
      de_baja,
      en_desuso,
      asignados,
      disponibles,
      totalMarcas,
      totalTipos,
      totalModelos,
      tipos,
      marcas,
    ] = await Promise.all([
      prisma.equipo.count(),
      prisma.equipo.count({ where: { estado_operativo: 'operativo' } }),
      prisma.equipo.count({ where: { estado_operativo: 'en_mantenimiento' } }),
      prisma.equipo.count({ where: { estado_operativo: 'de_baja' } }),
      prisma.equipo.count({ where: { estado_operativo: 'en_desuso' } }),
      prisma.equipo.count({ where: { funcionario_id: { not: null } } }),
      prisma.equipo.count({ where: { funcionario_id: null } }),
      prisma.marca.count({ where: { estado: true } }),
      prisma.tipoEquipo.count({ where: { estado: true } }),
      prisma.modelo.count({ where: { estado: true } }),
      prisma.tipoEquipo.findMany({
        select: {
          id: true,
          nombre: true,
          _count: {
            select: { equipos: true },
          },
        },
      }),
      prisma.marca.findMany({
        select: {
          id: true,
          nombre: true,
          _count: {
            select: { equipos: true },
          },
        },
      }),
    ]);

    const byTipo = tipos.map((t) => ({
      id: t.id,
      name: t.nombre,
      count: t._count.equipos,
    }));

    const byMarca = marcas.map((m) => ({
      id: m.id,
      name: m.nombre,
      count: m._count.equipos,
    }));

    return {
      total,
      operativo,
      en_mantenimiento,
      de_baja,
      en_desuso,
      asignados,
      disponibles,
      totalMarcas,
      totalTipos,
      totalModelos,
      byTipo,
      byMarca,
    };
  },

  // ─── MARCAS ──────────────────────────────────────────────────────────────────

  async getMarcas() {
    return prisma.marca.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { modelos: true, equipos: true, tipo_equipos: true },
        },
      },
    });
  },

  async createMarca(data: CreateMarcaInput) {
    const slug = data.slug || data.nombre.toLowerCase().replace(/\s+/g, '-');
    return prisma.marca.create({
      data: {
        nombre: data.nombre,
        slug,
        imagen: data.imagen || null,
        estado: data.estado ?? true,
      },
    });
  },

  async updateMarca(id: number, data: UpdateMarcaInput) {
    const slug = data.slug || (data.nombre ? data.nombre.toLowerCase().replace(/\s+/g, '-') : undefined);
    return prisma.marca.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(slug && { slug }),
        ...(data.imagen !== undefined && { imagen: data.imagen || null }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
    });
  },

  async deleteMarca(id: number) {
    return prisma.marca.delete({
      where: { id },
    });
  },

  // ─── TIPOS DE EQUIPO ─────────────────────────────────────────────────────────

  async getTiposEquipo(marcaId?: number) {
    return prisma.tipoEquipo.findMany({
      where: marcaId ? { marcaId } : undefined,
      orderBy: { nombre: 'asc' },
      include: {
        marca: true,
        _count: {
          select: { modelos: true, equipos: true },
        },
      },
    });
  },

  async createTipoEquipo(data: CreateTipoEquipoInput) {
    const slug = data.slug || data.nombre.toLowerCase().replace(/\s+/g, '-');
    return prisma.tipoEquipo.create({
      data: {
        nombre: data.nombre,
        slug,
        marcaId: data.marcaId || null,
        estado: data.estado ?? true,
      },
      include: {
        marca: true,
      },
    });
  },

  async updateTipoEquipo(id: number, data: UpdateTipoEquipoInput) {
    const slug = data.slug || (data.nombre ? data.nombre.toLowerCase().replace(/\s+/g, '-') : undefined);
    return prisma.tipoEquipo.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(slug && { slug }),
        ...(data.marcaId !== undefined && { marcaId: data.marcaId || null }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
      include: {
        marca: true,
      },
    });
  },

  async deleteTipoEquipo(id: number) {
    return prisma.tipoEquipo.delete({
      where: { id },
    });
  },

  // ─── MODELOS ─────────────────────────────────────────────────────────────────

  async getModelos(params?: { marcaId?: number; tipoEquipoId?: number }) {
    const where: Record<string, unknown> = {};
    if (params?.marcaId) where.marcaId = params.marcaId;
    if (params?.tipoEquipoId) where.tipo_equipo_id = params.tipoEquipoId;

    return prisma.modelo.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        marca: true,
        tipo_equipo: true,
        _count: {
          select: { equipos: true },
        },
      },
    });
  },

  async createModelo(data: CreateModeloInput) {
    const slug = data.slug || data.nombre.toLowerCase().replace(/\s+/g, '-');
    return prisma.modelo.create({
      data: {
        nombre: data.nombre,
        slug,
        marcaId: data.marcaId,
        tipo_equipo_id: data.tipo_equipo_id || null,
        especificaciones: data.especificaciones ? JSON.parse(JSON.stringify(data.especificaciones)) : null,
        estado: data.estado ?? true,
      },
      include: {
        marca: true,
        tipo_equipo: true,
      },
    });
  },

  async updateModelo(id: number, data: UpdateModeloInput) {
    const slug = data.slug || (data.nombre ? data.nombre.toLowerCase().replace(/\s+/g, '-') : undefined);
    return prisma.modelo.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(slug && { slug }),
        ...(data.marcaId !== undefined && { marcaId: data.marcaId }),
        ...(data.tipo_equipo_id !== undefined && { tipo_equipo_id: data.tipo_equipo_id || null }),
        ...(data.especificaciones !== undefined && {
          especificaciones: data.especificaciones ? JSON.parse(JSON.stringify(data.especificaciones)) : null,
        }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
      include: {
        marca: true,
        tipo_equipo: true,
      },
    });
  },

  async deleteModelo(id: number) {
    return prisma.modelo.delete({
      where: { id },
    });
  },
};
