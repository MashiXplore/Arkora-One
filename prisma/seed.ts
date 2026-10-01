import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 iniciando seed de base de datos...');

  // 1. Roles por defecto
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      description: 'Acceso total y gestión completa del sistema',
    },
  });

  const tecnicoRole = await prisma.role.upsert({
    where: { name: 'Técnico' },
    update: {},
    create: {
      name: 'Técnico',
      description: 'Atención de incidencias y mantenimiento de equipos',
    },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: 'Supervisor' },
    update: {},
    create: {
      name: 'Supervisor',
      description: 'Supervisión de asignaciones e informes',
    },
  });

  const solicitanteRole = await prisma.role.upsert({
    where: { name: 'Solicitante' },
    update: {},
    create: {
      name: 'Solicitante',
      description: 'Empleado que reporta incidencias y consulta sus equipos',
    },
  });

  console.log('✅ Roles creados/verificados');

  // 2. Módulos por defecto
  const modules = [
    { name: 'Usuarios', slug: 'users', description: 'Gestión de usuarios y roles' },
    { name: 'Inventario', slug: 'inventory', description: 'Gestión de equipos informáticos' },
    { name: 'Asignaciones', slug: 'assignments', description: 'Asignación de equipos a personal' },
    { name: 'Incidencias', slug: 'incidents', description: 'Reporte y seguimiento de fallas' },
    { name: 'Órdenes de Servicio', slug: 'work-orders', description: 'Mantenimientos preventivos y correctivos' },
  ];

  for (const mod of modules) {
    const createdMod = await prisma.module.upsert({
      where: { slug: mod.slug },
      update: {},
      create: mod,
    });

    // Asignar permisos completos al Admin
    await prisma.rolePermission.upsert({
      where: {
        roleId_moduleId: {
          roleId: adminRole.id,
          moduleId: createdMod.id,
        },
      },
      update: { canCreate: true, canRead: true, canUpdate: true, canDelete: true },
      create: {
        roleId: adminRole.id,
        moduleId: createdMod.id,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
      },
    });
  }

  console.log('✅ Módulos y Permisos configurados');

  // 3. Usuario Administrador Inicial
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Administrador Diaconía',
      username: 'admin',
      email: 'admin@diaconia.org.bo',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log(`✅ Usuario Admin creado: admin (${adminUser.email}) / Contraseña: Admin123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
