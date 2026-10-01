// src/app/api/v1/permissions/route.ts
// GET /api/v1/permissions — Matriz de permisos por rol y módulo
// PUT /api/v1/permissions — Actualización de permisos de rol por módulo
// Skill: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { roleService } from '@/backend/services/role.service';
import { updatePermissionSchema } from '@/backend/validators/role.validator';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const rolesPermissions = await roleService.getPermissionsMatrix();
    return NextResponse.json({
      success: true,
      data: rolesPermissions,
      message: 'Matriz de permisos obtenida correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/permissions]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = updatePermissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const updated = await roleService.updatePermission(result.data);
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Permiso actualizado correctamente',
    });
  } catch (error) {
    console.error('[PUT /api/v1/permissions]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
