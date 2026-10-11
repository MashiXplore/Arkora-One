// src/app/api/v1/equipos/tipos/route.ts
// GET y POST para Tipos de Equipo
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { equipoService } from '@/backend/services/equipo.service';
import { createTipoEquipoSchema } from '@/backend/validators/equipo.validator';

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
    const marcaId = searchParams.get('marcaId') ? Number(searchParams.get('marcaId')) : undefined;

    const tipos = await equipoService.getTiposEquipo(marcaId);

    return NextResponse.json({
      success: true,
      data: tipos,
      message: 'Tipos de equipo obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/equipos/tipos]', error);
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
    const result = createTipoEquipoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const tipo = await equipoService.createTipoEquipo(result.data);

    return NextResponse.json(
      {
        success: true,
        data: tipo,
        message: 'Tipo de equipo creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/equipos/tipos]', error);
    const message = error instanceof Error ? error.message : 'Error al crear tipo de equipo';
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
