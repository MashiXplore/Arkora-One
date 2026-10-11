// src/app/api/v1/funcionarios/metrics/route.ts
// GET /api/v1/funcionarios/metrics — Métricas ejecutivas y distribución
// Skills: api-design-principles, security-auditor

import { NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { funcionarioService } from '@/backend/services/funcionario.service';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const metrics = await funcionarioService.getMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Métricas obtenidas correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/funcionarios/metrics]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
