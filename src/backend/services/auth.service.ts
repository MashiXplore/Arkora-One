import { userRepository } from '@/backend/repositories/user.repository';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { LoginInput } from '@/backend/validators/user.validator';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-jwt-signing-arkora-32chars'
);

export const authService = {
  async login(data: LoginInput) {
    const user = await userRepository.findByEmailWithHash(data.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new Error('El usuario se encuentra inactivo. Contacte al administrador.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRES_IN || '8h')
      .sign(SECRET_KEY);

    const safeUser = await userRepository.findById(user.id);

    return { token, user: safeUser };
  },

  async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      return payload;
    } catch {
      return null;
    }
  },
};
