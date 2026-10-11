// src/app/api/v1/equipos/modelos/route.ts
// GET y POST para Modelos de equipo
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { equipoService } from '@/backend/services/equipo.service';
import { createModeloSchema } from '@/backend/validators/equipo.validator';

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
    const tipoEquipoId = searchParams.get('tipoEquipoId') ? Number(searchParams.get('tipoEquipoId')) : undefined;

    const modelos = await equipoService.getModelos({ marcaId, tipoEquipoId });

    return NextResponse.json({
      success: true,
      data: modelos,
      message: 'Modelos obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/equipos/modelos]', error);
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
    const result = createModeloSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const modelo = await equipoService.createModelo(result.data);

    return NextResponse.json(
      {
        success: true,
        data: modelo,
        message: 'Modelo creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/equipos/modelos]', error);
    const message = error instanceof Error ? error.message : 'Error al crear modelo';
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
