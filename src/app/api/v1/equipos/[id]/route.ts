// src/app/api/v1/equipos/[id]/route.ts
// GET, PUT, DELETE para equipo por ID
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { equipoService } from '@/backend/services/equipo.service';
import { updateEquipoSchema } from '@/backend/validators/equipo.validator';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const equipo = await equipoService.getEquipoById(Number(id));

    return NextResponse.json({
      success: true,
      data: equipo,
      message: 'Equipo obtenido correctamente',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message } },
      { status: 404 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const result = updateEquipoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const updated = await equipoService.updateEquipo(Number(id), result.data);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Equipo actualizado correctamente',
    });
  } catch (error) {
    let message = error instanceof Error ? error.message : 'Error al actualizar';
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      message = 'El código de etiqueta / activo ingresado ya está registrado en el sistema. Debe ser único.';
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    await equipoService.deleteEquipo(Number(id));

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Equipo eliminado correctamente',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar';
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message } },
      { status: 400 }
    );
  }
}
