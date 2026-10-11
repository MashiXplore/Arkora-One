// src/app/api/v1/funcionarios/[id]/route.ts
// GET, PUT, DELETE para funcionario por ID
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { funcionarioService } from '@/backend/services/funcionario.service';
import { updateFuncionarioSchema } from '@/backend/validators/funcionario.validator';

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
    const funcionario = await funcionarioService.getFuncionarioById(Number(id));

    return NextResponse.json({
      success: true,
      data: funcionario,
      message: 'Funcionario obtenido correctamente',
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
    const result = updateFuncionarioSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const updated = await funcionarioService.updateFuncionario(Number(id), result.data);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Funcionario actualizado correctamente',
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
    await funcionarioService.deleteFuncionario(Number(id));

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Funcionario eliminado correctamente',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar';
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message } },
      { status: 400 }
    );
  }
}
