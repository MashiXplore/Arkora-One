// src/backend/repositories/orden.repository.ts
// Capa de acceso a datos para Órdenes de Servicio e Informes Técnicos usando Prisma
// Skill: typescript-pro, api-design-principles

import { prisma } from '@/backend/db/prisma';
import type {
  CreateOrdenInput,
  UpdateOrdenInput,
  CreateInformeInput,
  UpdateInformeInput,
} from '@/backend/validators/orden.validator';
import { Prisma, type EstadoOrden, type TipoServicio, type Prioridad } from '@prisma/client';

const ordenInclude = {
  recepcionista: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
    },
  },
  tecnico: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
    },
  },
  equipo: {
    include: {
      marca: true,
      modelo: true,
      tipo_equipo: true,
    },
  },
  funcionario: {
    include: {
      cargo: true,
      agencia: {
        include: {
          sucursal: true,
        },
      },
    },
  },
  informe: true,
} as const;

const informeInclude = {
  tecnico: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
    },
  },
  agencia: {
    select: {
      id: true,
      nombre: true,
    },
  },
  orden: {
    include: {
      equipo: {
        include: {
          marca: true,
          modelo: true,
          tipo_equipo: true,
        },
      },
      funcionario: {
        select: {
          id: true,
          nombre: true,
          departamento_area: true,
          agencia: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
  },
} as const;

export const ordenRepository = {
  /** Genera el siguiente correlativo secuencial institucional (ej. ORD-2026-0001) */
  async generateNextNumeroOrden(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `ORD-${currentYear}-`;

    const lastOrder = await prisma.orden.findFirst({
      where: {
        numero_orden: {
          startsWith: prefix,
        },
      },
      orderBy: {
        id: 'desc',
      },
      select: {
        numero_orden: true,
      },
    });

    if (!lastOrder) {
      return `${prefix}0001`;
    }

    const parts = lastOrder.numero_orden.split('-');
    const currentSeq = parseInt(parts[parts.length - 1] || '0', 10);
    const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  },

  async findMany(params: {
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
    const {
      page,
      pageSize,
      search,
      estado,
      tipo_servicio,
      prioridad,
      id_tecnico,
      id_funcionario,
      id_equipo,
    } = params;

    const skip = (page - 1) * pageSize;
    const where: Prisma.OrdenWhereInput = {};

    if (estado) {
      where.estado = estado;
    }

    if (tipo_servicio) {
      where.tipo_servicio = tipo_servicio;
    }

    if (prioridad) {
      where.prioridad = prioridad;
    }

    if (id_tecnico) {
      where.id_tecnico = id_tecnico;
    }

    if (id_funcionario) {
      where.id_funcionario = id_funcionario;
    }

    if (id_equipo) {
      where.id_equipo = id_equipo;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { numero_orden: { contains: q } },
        { diagnostico_inicial: { contains: q } },
        { equipo: { numero_etiqueta: { contains: q } } },
        { equipo: { numero_serie: { contains: q } } },
        { funcionario: { nombre: { contains: q } } },
        { tecnico: { name: { contains: q } } },
      ];
    }

    const [ordenes, totalRecords] = await prisma.$transaction([
      prisma.orden.findMany({
        where,
        include: ordenInclude,
        skip,
        take: pageSize,
        orderBy: { fecha: 'desc' },
      }),
      prisma.orden.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      ordenes,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages,
      },
    };
  },

  async findById(id: number) {
    return prisma.orden.findUnique({
      where: { id },
      include: ordenInclude,
    });
  },

  async findByNumero(numero_orden: string) {
    return prisma.orden.findUnique({
      where: { numero_orden },
      include: ordenInclude,
    });
  },

  async create(data: CreateOrdenInput) {
    const numero_orden = data.numero_orden?.trim() || (await this.generateNextNumeroOrden());

    return prisma.orden.create({
      data: {
        numero_orden,
        fecha: data.fecha,
        estado: data.estado,
        tipo_servicio: data.tipo_servicio,
        prioridad: data.prioridad,
        diagnostico_inicial: data.diagnostico_inicial,
        fecha_estimada_entrega: data.fecha_estimada_entrega,
        especificaciones: data.especificaciones
          ? typeof data.especificaciones === 'object'
            ? JSON.stringify(data.especificaciones)
            : String(data.especificaciones)
          : null,
        id_recepcion: data.id_recepcion,
        id_tecnico: data.id_tecnico || null,
        id_equipo: data.id_equipo,
        id_funcionario: data.id_funcionario,
      },
      include: ordenInclude,
    });
  },

  async update(id: number, data: UpdateOrdenInput) {
    const updateData: Prisma.OrdenUpdateInput = {};

    if (data.numero_orden !== undefined) updateData.numero_orden = data.numero_orden;
    if (data.fecha !== undefined) updateData.fecha = data.fecha;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.tipo_servicio !== undefined) updateData.tipo_servicio = data.tipo_servicio;
    if (data.prioridad !== undefined) updateData.prioridad = data.prioridad;
    if (data.diagnostico_inicial !== undefined) updateData.diagnostico_inicial = data.diagnostico_inicial;
    if (data.fecha_estimada_entrega !== undefined) updateData.fecha_estimada_entrega = data.fecha_estimada_entrega;
    if (data.especificaciones !== undefined) {
      updateData.especificaciones = data.especificaciones
        ? typeof data.especificaciones === 'object'
          ? JSON.stringify(data.especificaciones)
          : String(data.especificaciones)
        : null;
    }
    if (data.id_recepcion !== undefined) updateData.recepcionista = { connect: { id: data.id_recepcion } };
    if (data.id_tecnico !== undefined) {
      updateData.tecnico = data.id_tecnico ? { connect: { id: data.id_tecnico } } : { disconnect: true };
    }
    if (data.id_equipo !== undefined) updateData.equipo = { connect: { id: data.id_equipo } };
    if (data.id_funcionario !== undefined) updateData.funcionario = { connect: { id: data.id_funcionario } };

    return prisma.orden.update({
      where: { id },
      data: updateData,
      include: ordenInclude,
    });
  },

  async delete(id: number) {
    // Si existe informe asociado, se elimina primero para evitar conflicto de clave foránea
    await prisma.informe.deleteMany({
      where: { orden_id: id },
    });

    return prisma.orden.delete({
      where: { id },
    });
  },

  async getMetrics() {
    const [
      total,
      creado,
      en_proceso,
      finalizado,
      entregado,
      cancelado,
      conInforme,
      prioridadGroups,
      tipoServicioGroups,
      tecnicosWithCounts,
    ] = await prisma.$transaction([
      prisma.orden.count(),
      prisma.orden.count({ where: { estado: 'creado' } }),
      prisma.orden.count({ where: { estado: 'en_proceso' } }),
      prisma.orden.count({ where: { estado: 'finalizado' } }),
      prisma.orden.count({ where: { estado: 'entregado' } }),
      prisma.orden.count({ where: { estado: 'cancelado' } }),
      prisma.orden.count({ where: { informe: { isNot: null } } }),
      prisma.orden.groupBy({
        by: ['prioridad'],
        _count: { id: true },
        orderBy: { prioridad: 'asc' },
      }),
      prisma.orden.groupBy({
        by: ['tipo_servicio'],
        _count: { id: true },
        orderBy: { tipo_servicio: 'asc' },
      }),
      prisma.user.findMany({
        where: {
          role: {
            name: { in: ['Técnico', 'tecnico', 'Administrador'] },
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              ordenesAsignadas: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const sinInforme = total - conInforme;

    const byPrioridad = prioridadGroups.map((p) => {
      const count = (p as unknown as { _count?: { id?: number } })._count?.id ?? 0;
      return {
        name: p.prioridad,
        count,
      };
    });

    const byTipoServicio = tipoServicioGroups.map((s) => {
      const count = (s as unknown as { _count?: { id?: number } })._count?.id ?? 0;
      return {
        name: s.tipo_servicio,
        count,
      };
    });

    const byTecnico = tecnicosWithCounts.map((t) => ({
      id: t.id,
      name: t.name,
      count: t._count.ordenesAsignadas,
    }));

    return {
      total,
      creado,
      en_proceso,
      finalizado,
      entregado,
      cancelado,
      conInforme,
      sinInforme,
      byPrioridad,
      byTipoServicio,
      byTecnico,
    };
  },
};

export const informeRepository = {
  async findMany(params: {
    page: number;
    pageSize: number;
    search?: string;
    tecnicoId?: number;
    agenciaId?: number;
    ordenId?: number;
  }) {
    const { page, pageSize, search, tecnicoId, agenciaId, ordenId } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InformeWhereInput = {};

    if (tecnicoId) where.user_id = tecnicoId;
    if (agenciaId) where.agencia_id = agenciaId;
    if (ordenId) where.orden_id = ordenId;

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { titulo: { contains: q } },
        { tipo_informe: { contains: q } },
        { descripcion: { contains: q } },
        { diagnostico_final: { contains: q } },
        { solucion_aplicada: { contains: q } },
        { orden: { numero_orden: { contains: q } } },
        { tecnico: { name: { contains: q } } },
      ];
    }

    const [informes, totalRecords] = await prisma.$transaction([
      prisma.informe.findMany({
        where,
        include: informeInclude,
        skip,
        take: pageSize,
        orderBy: { fecha: 'desc' },
      }),
      prisma.informe.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      informes,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages,
      },
    };
  },

  async findById(id: number) {
    return prisma.informe.findUnique({
      where: { id },
      include: informeInclude,
    });
  },

  async findByOrdenId(orden_id: number) {
    return prisma.informe.findUnique({
      where: { orden_id },
      include: informeInclude,
    });
  },

  async create(data: CreateInformeInput) {
    return prisma.informe.create({
      data: {
        tipo_informe: data.tipo_informe,
        titulo: data.titulo,
        descripcion: data.descripcion,
        diagnostico_final: data.diagnostico_final,
        solucion_aplicada: data.solucion_aplicada,
        fecha: data.fecha,
        archivo_ruta: data.archivo_ruta,
        user_id: data.user_id,
        orden_id: data.orden_id,
        agencia_id: data.agencia_id || null,
      },
      include: informeInclude,
    });
  },

  async update(id: number, data: UpdateInformeInput) {
    const updateData: Prisma.InformeUpdateInput = {};

    if (data.tipo_informe !== undefined) updateData.tipo_informe = data.tipo_informe;
    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.diagnostico_final !== undefined) updateData.diagnostico_final = data.diagnostico_final;
    if (data.solucion_aplicada !== undefined) updateData.solucion_aplicada = data.solucion_aplicada;
    if (data.fecha !== undefined) updateData.fecha = data.fecha;
    if (data.archivo_ruta !== undefined) updateData.archivo_ruta = data.archivo_ruta;
    if (data.user_id !== undefined) updateData.tecnico = { connect: { id: data.user_id } };
    if (data.agencia_id !== undefined) {
      updateData.agencia = data.agencia_id ? { connect: { id: data.agencia_id } } : { disconnect: true };
    }

    return prisma.informe.update({
      where: { id },
      data: updateData,
      include: informeInclude,
    });
  },

  async delete(id: number) {
    return prisma.informe.delete({
      where: { id },
    });
  },

  async getMetrics() {
    const [total, byTipoGroups] = await prisma.$transaction([
      prisma.informe.count(),
      prisma.informe.groupBy({
        by: ['tipo_informe'],
        _count: { id: true },
        orderBy: { tipo_informe: 'asc' },
      }),
    ]);

    return {
      total,
      byTipo: byTipoGroups.map((g) => {
        const count = (g as unknown as { _count?: { id?: number } })._count?.id ?? 0;
        return {
          name: g.tipo_informe,
          count,
        };
      }),
    };
  },
};
