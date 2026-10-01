// src/app/api/v1/users/route.ts
// GET  /api/v1/users  — Lista paginada de usuarios
// POST /api/v1/users  — Crear nuevo usuario
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { userService } from '@/backend/services/user.service';
import { createUserSchema } from '@/backend/validators/user.validator';

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

    const { users, pagination } = await userService.getUsers({ page, pageSize, search });

    return NextResponse.json({
      success: true,
      data: users,
      pagination,
      message: 'Usuarios obtenidos correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/users]', error);
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
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const user = await userService.createUser(result.data);
    return NextResponse.json(
      { success: true, data: user, message: 'Usuario creado correctamente' },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Detectar duplicado de email/username en MySQL
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_ENTRY', message: 'El correo o nombre de usuario ya está en uso' } },
        { status: 409 }
      );
    }
    console.error('[POST /api/v1/users]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
