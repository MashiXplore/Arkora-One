// src/app/api/v1/users/[id]/route.ts
// GET, PUT, DELETE para un usuario específico por ID
// Skill: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/backend/middleware/auth.middleware';
import { userService } from '@/backend/services/user.service';
import { updateUserSchema } from '@/backend/validators/user.validator';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const user = await userService.getUserById(Number(id));
    return NextResponse.json({
      success: true,
      data: user,
      message: 'Usuario obtenido correctamente',
    });
  } catch (error) {
    console.error('[GET /api/v1/users/[id]]', error);
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const updatedUser = await userService.updateUser(Number(id), result.data);
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado correctamente',
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_ENTRY', message: 'El correo o nombre de usuario ya está en uso' } },
        { status: 409 }
      );
    }
    console.error('[PUT /api/v1/users/[id]]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await userService.deleteUser(Number(id));
    return NextResponse.json({
      success: true,
      data: null,
      message: 'Usuario eliminado correctamente',
    });
  } catch (error) {
    console.error('[DELETE /api/v1/users/[id]]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error al eliminar el usuario' } },
      { status: 500 }
    );
  }
}
