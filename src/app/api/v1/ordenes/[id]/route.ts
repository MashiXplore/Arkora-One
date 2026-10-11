// src/app/api/v1/ordenes/[id]/route.ts
// GET, PUT, DELETE para una orden específica
// Skills: api-design-principles, security-auditor, typescript-pro

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { ordenService } from '@/backend/services/orden.service';
import { updateOrdenSchema } from '@/backend/validators/orden.validator';

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
    const orden = await ordenService.getOrdenById(Number(id));

    return NextResponse.json({
      success: true,
      data: orden,
      message: 'Orden obtenida correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/ordenes/:id]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error instanceof Error ? error.message : 'Orden no encontrada',
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

    const result = updateOrdenSchema.safeParse(body);
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

    const actualizada = await ordenService.updateOrden(Number(id), result.data);

    return NextResponse.json({
      success: true,
      data: actualizada,
      message: 'Orden de servicio actualizada correctamente',
    });
  } catch (error) {
    console.error('[PUT /api/v1/ordenes/:id]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al actualizar orden',
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
    await ordenService.deleteOrden(Number(id));

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Orden eliminada correctamente',
    });
  } catch (error) {
    console.error('[DELETE /api/v1/ordenes/:id]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al eliminar orden',
        },
      },
      { status: 500 }
    );
  }
}
