// src/app/api/v1/informes/metrics/route.ts
// GET /api/v1/informes/metrics — Métricas de informes técnicos
// Skills: api-design-principles, security-auditor, typescript-pro

import { NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { ordenService } from '@/backend/services/orden.service';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const metrics = await ordenService.getInformeMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Métricas de informes obtenidas correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/informes/metrics]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error al obtener métricas' } },
      { status: 500 }
    );
  }
}
