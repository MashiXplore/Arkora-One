// src/app/api/v1/users/seed/route.ts
// POST /api/v1/users/seed — Poblar usuarios iniciales para los roles por defecto
// Skill: api-design-principles, security-auditor

import { NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { roleService } from '@/backend/services/role.service';

export async function POST() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const createdUsers = await roleService.seedDemoUsers();
    return NextResponse.json({
      success: true,
      data: createdUsers,
      message: 'Usuarios por defecto creados/verificados correctamente',
    });
  } catch (error) {
    console.error('[POST /api/v1/users/seed]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error al generar usuarios por defecto' } },
      { status: 500 }
    );
  }
}
