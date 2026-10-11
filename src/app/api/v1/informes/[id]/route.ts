// src/app/api/v1/informes/[id]/route.ts
// GET, PUT, DELETE para un informe técnico específico
// Skills: api-design-principles, security-auditor, typescript-pro

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { ordenService } from '@/backend/services/orden.service';
import { updateInformeSchema } from '@/backend/validators/orden.validator';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const informe = await ordenService.getInformeById(Number(id));

    return NextResponse.json({
      success: true,
      data: informe,
      message: 'Informe obtenido correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/informes/:id]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error instanceof Error ? error.message : 'Informe no encontrado',
        },
      },
      { status: 404 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const result = updateInformeSchema.safeParse(body);
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

    const actualizado = await ordenService.updateInforme(Number(id), result.data);

    return NextResponse.json({
      success: true,
      data: actualizado,
      message: 'Informe técnico actualizado correctamente',
    });
  } catch (error) {
    console.error('[PUT /api/v1/informes/:id]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al actualizar informe técnico',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await ordenService.deleteInforme(Number(id));

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Informe técnico eliminado correctamente',
    });
  } catch (error) {
    console.error('[DELETE /api/v1/informes/:id]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al eliminar informe técnico',
        },
      },
      { status: 500 }
    );
  }
}
