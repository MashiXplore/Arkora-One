// src/app/api/v1/auth/me/route.ts
// GET /api/v1/auth/me — Obtiene la información de la sesión actual
// Skill: api-design-principles, security-auditor

import { NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Sesión no válida o expirada' } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Sesión recuperada correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/auth/me]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
