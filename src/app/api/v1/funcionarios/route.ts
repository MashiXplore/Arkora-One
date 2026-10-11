// src/app/api/v1/funcionarios/route.ts
// GET  /api/v1/funcionarios — Lista paginada con filtros
// POST /api/v1/funcionarios — Crear funcionario
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { funcionarioService } from '@/backend/services/funcionario.service';
import { createFuncionarioSchema } from '@/backend/validators/funcionario.validator';

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
    const sucursalId = searchParams.get('sucursalId') ? Number(searchParams.get('sucursalId')) : undefined;
    const agenciaId = searchParams.get('agenciaId') ? Number(searchParams.get('agenciaId')) : undefined;
    const cargoId = searchParams.get('cargoId') ? Number(searchParams.get('cargoId')) : undefined;
    const estadoParam = searchParams.get('estado');
    const estado = estadoParam !== null && estadoParam !== undefined ? estadoParam === 'true' : undefined;

    const { funcionarios, pagination } = await funcionarioService.getFuncionarios({
      page,
      pageSize,
      search,
      sucursalId,
      agenciaId,
      cargoId,
      estado,
    });

    return NextResponse.json({
      success: true,
      data: funcionarios,
      pagination,
      message: 'Funcionarios obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/funcionarios]', error);
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
    const result = createFuncionarioSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const funcionario = await funcionarioService.createFuncionario(result.data);

    return NextResponse.json(
      {
        success: true,
        data: funcionario,
        message: 'Funcionario creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/funcionarios]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error al crear el funcionario' } },
      { status: 500 }
    );
  }
}
