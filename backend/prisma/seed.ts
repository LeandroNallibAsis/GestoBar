import * as dotenv from 'dotenv';
import path from 'path';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthService } from '../src/modules/auth/auth.service';

// Cargar variables de entorno desde el directorio raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 [SEED] Iniciando limpieza total...');
  // 1. Limpiar base de datos
  // El orden es CRÍTICO: primero eliminamos las tablas que dependen de otras
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "RolePermission" CASCADE');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cashEntry.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  // 2. Crear el negocio principal (Tenant)
  const business = await prisma.business.create({
    data: {
      name: 'GestoBar Principal',
    },
  });

  const permissions = [
    { key: 'orders:view', description: 'Ver Pedidos' },
    { key: 'orders:create', description: 'Crear Pedidos' },
    { key: 'orders:manage', description: 'Gestionar Pedidos (cambiar estado, cancelar)' },
    { key: 'tables:view', description: 'Ver Mesas' },
    { key: 'tables:manage', description: 'Gestionar Mesas (cambiar estado, CRUD)' },
    { key: 'inventory:view', description: 'Ver Menú/Productos' },
    { key: 'inventory:manage', description: 'Gestionar Menú/Productos' },
    { key: 'cash:view', description: 'Ver Caja' },
    { key: 'cash:manage', description: 'Gestionar Caja' },
    { key: 'reports:view', description: 'Ver Dashboard y Reportes' }
  ];

  for (const p of permissions) {
    await prisma.permission.create({ data: p });
  }

  // 3. Generar contraseña usando el servicio ya importado
  const rawPassword = 'admin123';
  const finalPassword = await AuthService.hashPassword(rawPassword);

  // 4. Crear el usuario Admin
  const adminEmail = 'admin@gestobar.com';
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: finalPassword,
      name: 'Administrador Sistema',
      role: UserRole.SuperAdmin,
      businessId: business.id,
    },
  });

  const mainCategory = await prisma.category.create({
    data: {
      name: 'Bebidas',
      type: 'INVENTORY',
      businessId: business.id,
    }
  });

  await prisma.inventoryItem.create({
    data: {
      name: 'Coca Cola 500ml',
      cost: 1000,
      stock: 50,
      categoryId: mainCategory.id,
      businessId: business.id,
    }
  });

  const menuCategory = await prisma.category.create({
    data: {
      name: 'Hamburguesas',
      type: 'MENU',
      businessId: business.id,
    }
  });

  await prisma.menuItem.create({
    data: {
      name: 'Hamburguesa Completa',
      price: 6500,
      categoryId: menuCategory.id,
      businessId: business.id,
    }
  });

  await prisma.table.create({
    data: {
      name: 'Mesa 1',
      capacity: 4,
      businessId: business.id,
    }
  });

  console.log('✅ Base de datos poblada con éxito:');
  console.log(`👤 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${rawPassword}`);
  console.log(`🛡️  Role: ${UserRole.SuperAdmin}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });