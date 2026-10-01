// src/backend/repositories/user.repository.ts
// Acceso a datos del módulo de Usuarios usando Prisma
// Skill: nextjs-app-router-patterns, typescript-pro

import { prisma } from '@/backend/db/prisma';
import type { CreateUserInput, UpdateUserInput } from '@/backend/validators/user.validator';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// Campos seguros para devolver (sin passwordHash)
const safeUserSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  roleId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: { id: true, name: true, description: true },
  },
} as const;

export const userRepository = {
  /** Obtiene todos los usuarios con paginación */
  async findMany(params: { page: number; pageSize: number; search?: string }) {
    const { page, pageSize, search } = params;
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { username: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [users, totalRecords] = await prisma.$transaction([
      prisma.user.findMany({ where, select: safeUserSelect, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return { users, totalRecords };
  },

  /** Obtiene un usuario por ID */
  async findById(id: number) {
    return prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  },

  /** Obtiene un usuario por email (incluye hash para login) */
  async findByEmailWithHash(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  /** Crea un nuevo usuario */
  async create(data: CreateUserInput) {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash,
        roleId: data.roleId,
      },
      select: safeUserSelect,
    });
  },

  /** Actualiza un usuario */
  async update(id: number, data: UpdateUserInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
      delete updateData.password;
    }
    return prisma.user.update({ where: { id }, data: updateData, select: safeUserSelect });
  },

  /** Elimina un usuario por ID */
  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  },

  /** Métricas detalladas para gráficos del módulo de usuarios */
  async getMetrics() {
    const [total, active, inactive, roles] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.role.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { users: true },
          },
        },
        orderBy: { id: 'asc' },
      }),
    ]);

    const byRole = roles.map((r) => ({
      roleId: r.id,
      roleName: r.name,
      count: r._count.users,
    }));

    return { total, active, inactive, byRole };
  },
};
