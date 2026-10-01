// src/backend/middleware/auth.middleware.ts
// Verificación de sesión JWT y autorización por rol
// Skill: security-auditor

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import type { AuthSession } from '@/types/user.types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-dev-secret');
const COOKIE_NAME = 'arkora_session';

/** Firma y genera un token JWT para la sesión */
export async function signSession(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '8h')
    .sign(JWT_SECRET);
}

/** Verifica y decodifica el token de sesión de la cookie */
export async function verifySession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

/** Nombre de la cookie de sesión */
export { COOKIE_NAME };
