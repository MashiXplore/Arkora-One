// src/app/api/v1/auth/login/route.ts
// Endpoint POST /api/v1/auth/login
// Skills: api-design-principles, security-auditor

import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/backend/validators/user.validator';
import { userRepository } from '@/backend/repositories/user.repository';
import { signSession, COOKIE_NAME } from '@/backend/middleware/auth.middleware';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types/user.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Buscar usuario con su hash
    const user = await userRepository.findByEmailWithHash(email);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Correo o contraseña incorrectos' } },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Correo o contraseña incorrectos' } },
        { status: 401 }
      );
    }

    // Obtener rol del usuario
    const fullUser = await userRepository.findById(user.id);
    const roleName = fullUser?.role?.name as UserRole;

    // Generar sesión JWT
    const token = await signSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
      isActive: user.isActive,
    });

    // Respuesta con cookie HttpOnly
    const response = NextResponse.json(
      {
        success: true,
        data: { userId: user.id, name: user.name, email: user.email, role: roleName },
        message: 'Sesión iniciada correctamente',
      },
      { status: 200 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return response;
  } catch (error) {
    console.error('[POST /api/v1/auth/login]', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
