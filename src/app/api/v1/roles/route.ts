// src/app/api/v1/roles/route.ts
// GET /api/v1/roles — Obtiene los roles del sistema
// Skill: api-design-principles, security-auditor

import { NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { roleService } from '@/backend/services/role.service';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const roles = await roleService.getRoles();
    return NextResponse.json({
      success: true,
      data: roles,
      message: 'Roles obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/roles]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
