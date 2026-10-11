// src/app/api/v1/funcionarios/sucursales/[id]/route.ts
// PUT y DELETE para Sucursal por ID
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { funcionarioService } from '@/backend/services/funcionario.service';
import { updateSucursalSchema } from '@/backend/validators/funcionario.validator';

interface RouteContext {
  params: Promise<{ id: string }>;
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
    const result = updateSucursalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const updated = await funcionarioService.updateSucursal(Number(id), result.data);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Sucursal actualizada correctamente',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar';
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
    await funcionarioService.deleteSucursal(Number(id));

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Sucursal eliminada correctamente',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar';
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message } },
      { status: 400 }
    );
  }
}
