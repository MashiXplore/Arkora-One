// src/backend/repositories/role.repository.ts
// Acceso a datos de Roles y Permisos en la base de datos usando Prisma
// Skill: typescript-pro, security-auditor

import { prisma } from '@/backend/db/prisma';
import type { UpdatePermissionInput } from '@/backend/validators/role.validator';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const roleRepository = {
  /** Obtiene la lista de roles con conteo de usuarios */
  async findAll() {
    return prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  },

  /** Obtiene todos los roles junto con la matriz de permisos por módulo */
  async findAllWithPermissions() {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            module: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    const modules = await prisma.module.findMany({ orderBy: { id: 'asc' } });

    // Asegurar que cada rol tenga entradas para todos los módulos
    for (const role of roles) {
      for (const mod of modules) {
        const exists = role.rolePermissions.some((rp) => rp.moduleId === mod.id);
        if (!exists) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              moduleId: mod.id,
              canCreate: role.name === 'Administrador',
              canRead: true,
              canUpdate: role.name === 'Administrador',
              canDelete: role.name === 'Administrador',
            },
          });
        }
      }
    }

    return prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            module: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  },

  /** Actualiza permisos de un rol para un módulo específico */
  async updatePermission(data: UpdatePermissionInput) {
    const { roleId, moduleId, ...permissions } = data;

    return prisma.rolePermission.upsert({
      where: {
        roleId_moduleId: {
          roleId,
          moduleId,
        },
      },
      update: permissions,
      create: {
        roleId,
        moduleId,
        canCreate: permissions.canCreate ?? false,
        canRead: permissions.canRead ?? true,
        canUpdate: permissions.canUpdate ?? false,
        canDelete: permissions.canDelete ?? false,
      },
      include: {
        module: true,
        role: true,
      },
    });
  },

  /** Semilla/Creación inicial de usuarios para todos los demás roles */
  async seedDemoUsers() {
    const roles = await prisma.role.findMany();
    const defaultPassword = await bcrypt.hash('Password123!', SALT_ROUNDS);

    const initialUsers = [
      {
        name: 'Carlos Técnico TI',
        username: 'tecnico.carlos',
        email: 'tecnico@diaconia.org.bo',
        roleName: 'Técnico',
      },
      {
        name: 'María Supervisora',
        username: 'supervisor.maria',
        email: 'supervisor@diaconia.org.bo',
        roleName: 'Supervisor',
      },
      {
        name: 'Juan Solicitante',
        username: 'solicitante.juan',
        email: 'solicitante@diaconia.org.bo',
        roleName: 'Solicitante',
      },
    ];

    const createdUsers = [];

    for (const item of initialUsers) {
      const role = roles.find((r) => r.name === item.roleName);
      if (role) {
        const user = await prisma.user.upsert({
          where: { username: item.username },
          update: {},
          create: {
            name: item.name,
            username: item.username,
            email: item.email,
            passwordHash: defaultPassword,
            roleId: role.id,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: { select: { id: true, name: true } },
          },
        });
        createdUsers.push(user);
      }
    }

    return createdUsers;
  },
};
