// src/app/api/v1/equipos/metrics/route.ts
// GET /api/v1/equipos/metrics — Métricas y distribución de inventario
// Skills: api-design-principles, security-auditor

import { NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { equipoService } from '@/backend/services/equipo.service';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const metrics = await equipoService.getMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Métricas de equipos obtenidas correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/equipos/metrics]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
