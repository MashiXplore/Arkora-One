// src/types/user.types.ts
// Tipos del módulo de Usuarios y Autenticación

export type UserRole = 'ADMINISTRADOR' | 'TECNICO' | 'SUPERVISOR' | 'SOLICITANTE';

export interface Role {
  id: number;
  name: UserRole;
  description: string | null;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: Role;
}

// Lo que devuelve la API (sin passwordHash)
export type UserDTO = Omit<User, 'passwordHash'>;
export type UserWithRole = User;

// Payload para crear usuario
export interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  roleId: number;
}

// Payload para editar usuario
export interface UpdateUserPayload {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  isActive?: boolean;
}

// Sesión del usuario autenticado (stored in cookie/context)
export interface AuthSession {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
