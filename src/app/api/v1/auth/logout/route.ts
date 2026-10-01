// src/app/api/v1/auth/logout/route.ts
// Endpoint POST /api/v1/auth/logout

import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/backend/middleware/auth.middleware';

export async function POST() {
  const response = NextResponse.json(
    { success: true, data: null, message: 'Sesión cerrada correctamente' },
    { status: 200 }
  );
  response.cookies.delete(COOKIE_NAME);
  return response;
}
