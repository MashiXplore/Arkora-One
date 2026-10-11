// src/app/api/v1/equipos/marcas/route.ts
// GET y POST para Marcas de equipo
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { equipoService } from '@/backend/services/equipo.service';
import { createMarcaSchema } from '@/backend/validators/equipo.validator';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const marcas = await equipoService.getMarcas();

    return NextResponse.json({
      success: true,
      data: marcas,
      message: 'Marcas obtenidas correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/equipos/marcas]', error);
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
    const result = createMarcaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const marca = await equipoService.createMarca(result.data);

    return NextResponse.json(
      {
        success: true,
        data: marca,
        message: 'Marca creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/equipos/marcas]', error);
    const message = error instanceof Error ? error.message : 'Error al crear la marca';
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
