// src/app/api/v1/funcionarios/agencias/route.ts
// GET y POST para Agencias
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { funcionarioService } from '@/backend/services/funcionario.service';
import { createAgenciaSchema } from '@/backend/validators/funcionario.validator';

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
    const sucursalId = searchParams.get('sucursalId') ? Number(searchParams.get('sucursalId')) : undefined;

    const agencias = await funcionarioService.getAgencias(sucursalId);

    return NextResponse.json({
      success: true,
      data: agencias,
      message: 'Agencias obtenidas correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/funcionarios/agencias]', error);
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
    const result = createAgenciaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const agencia = await funcionarioService.createAgencia(result.data);

    return NextResponse.json(
      {
        success: true,
        data: agencia,
        message: 'Agencia creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/funcionarios/agencias]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error al crear la agencia' } },
      { status: 500 }
    );
  }
}
