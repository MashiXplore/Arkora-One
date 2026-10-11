// src/app/api/v1/equipos/route.ts
// GET  /api/v1/equipos — Lista paginada con filtros
// POST /api/v1/equipos — Registrar nuevo equipo
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { equipoService } from '@/backend/services/equipo.service';
import { createEquipoSchema } from '@/backend/validators/equipo.validator';
import type { EstadoOperativo } from '@prisma/client';

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
    const marcaId = searchParams.get('marcaId') ? Number(searchParams.get('marcaId')) : undefined;
    const tipoEquipoId = searchParams.get('tipoEquipoId') ? Number(searchParams.get('tipoEquipoId')) : undefined;
    const modeloId = searchParams.get('modeloId') ? Number(searchParams.get('modeloId')) : undefined;
    const funcionarioIdParam = searchParams.get('funcionarioId');
    const funcionarioId = funcionarioIdParam ? Number(funcionarioIdParam) : undefined;
    const estadoOperativo = (searchParams.get('estadoOperativo') as EstadoOperativo) ?? undefined;

    const { equipos, pagination } = await equipoService.getEquipos({
      page,
      pageSize,
      search,
      marcaId,
      tipoEquipoId,
      modeloId,
      funcionarioId,
      estadoOperativo,
    });

    return NextResponse.json({
      success: true,
      data: equipos,
      pagination,
      message: 'Equipos obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/equipos]', error);
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
    const result = createEquipoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const equipo = await equipoService.createEquipo(result.data);

    return NextResponse.json(
      {
        success: true,
        data: equipo,
        message: 'Equipo registrado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/equipos]', error);
    let message = error instanceof Error ? error.message : 'Error al registrar equipo';
    
    // Si Prisma lanzó error P2002 de clave única
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      message = 'El código de etiqueta / activo ingresado ya está registrado en el sistema. Debe ingresar un código diferente.';
    }

    return NextResponse.json(
      { success: false, error: { code: 'DUPLICATE_ERROR', message } },
      { status: 400 }
    );
  }
}
