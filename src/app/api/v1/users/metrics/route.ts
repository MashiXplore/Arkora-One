// src/app/api/v1/users/metrics/route.ts
// GET /api/v1/users/metrics — Métricas del módulo de usuarios

import { NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { userService } from '@/backend/services/user.service';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const metrics = await userService.getUserMetrics();
    return NextResponse.json({ success: true, data: metrics, message: 'Métricas obtenidas' });
  } catch (error) {
    console.error('[GET /api/v1/users/metrics]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
