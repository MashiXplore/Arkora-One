// src/app/api/v1/ordenes/route.ts
// GET  /api/v1/ordenes — Lista paginada con filtros
// POST /api/v1/ordenes — Registrar nueva orden de servicio
// Skills: api-design-principles, security-auditor, typescript-pro

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { ordenService } from '@/backend/services/orden.service';
import { createOrdenSchema } from '@/backend/validators/orden.validator';
import type { EstadoOrden, TipoServicio, Prioridad } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '10')));
    const search = searchParams.get('search') ?? undefined;
    const estado = (searchParams.get('estado') as EstadoOrden) ?? undefined;
    const tipo_servicio = (searchParams.get('tipo_servicio') as TipoServicio) ?? undefined;
    const prioridad = (searchParams.get('prioridad') as Prioridad) ?? undefined;
    const id_tecnico = searchParams.get('id_tecnico') ? Number(searchParams.get('id_tecnico')) : undefined;
    const id_funcionario = searchParams.get('id_funcionario') ? Number(searchParams.get('id_funcionario')) : undefined;
    const id_equipo = searchParams.get('id_equipo') ? Number(searchParams.get('id_equipo')) : undefined;

    const { ordenes, pagination } = await ordenService.getOrdenes({
      page,
      pageSize,
      search,
      estado,
      tipo_servicio,
      prioridad,
      id_tecnico,
      id_funcionario,
      id_equipo,
    });

    return NextResponse.json({
      success: true,
      data: ordenes,
      pagination,
      message: 'Órdenes obtenidas correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/ordenes]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Si no se especifica id_recepcion, usar el usuario de la sesión actual
    if (!body.id_recepcion && session.userId) {
      body.id_recepcion = session.userId;
    }

    const result = createOrdenSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.errors[0]?.message ?? 'Datos inválidos',
          },
        },
        { status: 400 }
      );
    }

    const nuevaOrden = await ordenService.createOrden(result.data);

    return NextResponse.json(
      {
        success: true,
        data: nuevaOrden,
        message: 'Orden de servicio creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/ordenes]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error interno del servidor',
        },
      },
      { status: 500 }
    );
  }
}
