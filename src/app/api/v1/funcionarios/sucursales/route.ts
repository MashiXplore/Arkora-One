// src/app/api/v1/funcionarios/sucursales/route.ts
// GET y POST para Sucursales
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { funcionarioService } from '@/backend/services/funcionario.service';
import { createSucursalSchema } from '@/backend/validators/funcionario.validator';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const sucursales = await funcionarioService.getSucursales();

    return NextResponse.json({
      success: true,
      data: sucursales,
      message: 'Sucursales obtenidas correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/funcionarios/sucursales]', error);
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
    const result = createSucursalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const sucursal = await funcionarioService.createSucursal(result.data);

    return NextResponse.json(
      {
        success: true,
        data: sucursal,
        message: 'Sucursal creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/funcionarios/sucursales]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error al crear la sucursal' } },
      { status: 500 }
    );
  }
}
