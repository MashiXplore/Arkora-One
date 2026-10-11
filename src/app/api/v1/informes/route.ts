// src/app/api/v1/informes/route.ts
// GET  /api/v1/informes — Lista de informes técnicos paginada
// POST /api/v1/informes — Registrar nuevo informe técnico
// Skills: api-design-principles, security-auditor, typescript-pro

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { ordenService } from '@/backend/services/orden.service';
import { createInformeSchema } from '@/backend/validators/orden.validator';

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
    const tecnicoId = searchParams.get('tecnicoId') ? Number(searchParams.get('tecnicoId')) : undefined;
    const agenciaId = searchParams.get('agenciaId') ? Number(searchParams.get('agenciaId')) : undefined;
    const ordenId = searchParams.get('ordenId') ? Number(searchParams.get('ordenId')) : undefined;

    const { informes, pagination } = await ordenService.getInformes({
      page,
      pageSize,
      search,
      tecnicoId,
      agenciaId,
      ordenId,
    });

    return NextResponse.json({
      success: true,
      data: informes,
      pagination,
      message: 'Informes obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/informes]', error);
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

    // Asignar el técnico de la sesión actual si no se provee
    if (!body.user_id && session.userId) {
      body.user_id = session.userId;
    }

    const result = createInformeSchema.safeParse(body);
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

    const nuevoInforme = await ordenService.createInforme(result.data);

    return NextResponse.json(
      {
        success: true,
        data: nuevoInforme,
        message: 'Informe técnico generado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/informes]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al registrar informe técnico',
        },
      },
      { status: 500 }
    );
  }
}
