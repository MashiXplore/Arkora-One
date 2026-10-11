// src/app/api/v1/funcionarios/cargos/route.ts
// GET y POST para Cargos
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { funcionarioService } from '@/backend/services/funcionario.service';
import { createCargoSchema } from '@/backend/validators/funcionario.validator';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const cargos = await funcionarioService.getCargos();

    return NextResponse.json({
      success: true,
      data: cargos,
      message: 'Cargos obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/funcionarios/cargos]', error);
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
    const result = createCargoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const cargo = await funcionarioService.createCargo(result.data);

    return NextResponse.json(
      {
        success: true,
        data: cargo,
        message: 'Cargo creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/funcionarios/cargos]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error al crear el cargo' } },
      { status: 500 }
    );
  }
}
