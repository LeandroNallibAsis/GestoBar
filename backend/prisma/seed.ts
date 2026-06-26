/**
 * ============================================================
 * SEED.TS
 * ============================================================
 * Script de inicialización (seeding) de la base de datos.
 * Genera los datos iniciales necesarios para que el sistema
 * funcione correctamente en un entorno de desarrollo o pruebas.
 *
 * Datos que crea:
 * - Un negocio principal ("GestoBar Principal") como tenant base
 * - Los permisos del sistema (orders, tables, inventory, cash, reports)
 * - Un usuario SuperAdmin con credenciales por defecto
 * - Una categoría de inventario con un insumo de ejemplo
 * - Una categoría de menú con un producto de ejemplo
 * - Una mesa de ejemplo con capacidad para 4 personas
 *
 * IMPORTANTE: Este script ELIMINA TODOS los datos existentes
 * antes de crear los nuevos. No debe ejecutarse en producción
 * sin precaución.
 *
 * Tabla(s) relacionada(s): Todas las tablas del sistema
 * Módulo: Inicialización / Seeding
 * ============================================================
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthService } from '../src/modules/auth/auth.service';

// Cargar variables de entorno desde el directorio raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/** Instancia de PrismaClient exclusiva para el script de seeding */
const prisma = new PrismaClient();

/**
 * Función principal del seed.
 * Ejecuta la limpieza completa de la BD y luego crea los datos iniciales.
 * El orden de eliminación respeta las dependencias entre tablas (FK).
 */
async function main() {
  console.log('🚀 [SEED] Iniciando limpieza total...');
  // 1. Limpiar base de datos
  // El orden es CRÍTICO: primero eliminamos las tablas que dependen de otras
  // Se usa DROP CASCADE para RolePermission porque puede tener restricciones complejas
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
  // Este es el tenant base del sistema; todos los datos de ejemplo se vinculan a él
  const business = await prisma.business.create({
    data: {
      name: 'GestoBar Principal',
    },
  });

  // Definición de los permisos base del sistema.
  // Cada permiso tiene una clave única (key) que se utiliza en el middleware
  // de autorización para verificar acceso a funcionalidades específicas.
  // Formato de clave: 'modulo:accion' (ej: 'orders:create')
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

  // Crear cada permiso en la base de datos
  for (const p of permissions) {
    await prisma.permission.create({ data: p });
  }

  // 3. Generar contraseña usando el servicio ya importado
  // Se usa el mismo servicio de hash que usa la aplicación para consistencia
  const rawPassword = 'admin123';
  const finalPassword = await AuthService.hashPassword(rawPassword);

  // 4. Crear el usuario Admin
  // Este usuario SuperAdmin tiene acceso completo al sistema
  // Credenciales por defecto: admin@gestobar.com / admin123
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

  // 5. Crear categoría de inventario con un insumo de ejemplo
  // Esto demuestra la funcionalidad de gestión de stock interno
  const mainCategory = await prisma.category.create({
    data: {
      name: 'Bebidas',
      type: 'INVENTORY',
      businessId: business.id,
    }
  });

  // Insumo de ejemplo: una bebida con costo y stock inicial
  await prisma.inventoryItem.create({
    data: {
      name: 'Coca Cola 500ml',
      cost: 1000,   // Costo de compra: $1000
      stock: 50,    // Stock inicial: 50 unidades
      categoryId: mainCategory.id,
      businessId: business.id,
    }
  });

  // 6. Crear categoría de menú con un producto vendible de ejemplo
  // Esto demuestra la funcionalidad de carta/menú del establecimiento
  const menuCategory = await prisma.category.create({
    data: {
      name: 'Hamburguesas',
      type: 'MENU',
      businessId: business.id,
    }
  });

  // Producto de menú de ejemplo con precio de venta
  await prisma.menuItem.create({
    data: {
      name: 'Hamburguesa Completa',
      price: 6500,  // Precio de venta: $6500
      categoryId: menuCategory.id,
      businessId: business.id,
    }
  });

  // 7. Crear una mesa de ejemplo
  // Mesa con capacidad estándar de 4 personas, estado inicial FREE
  await prisma.table.create({
    data: {
      name: 'Mesa 1',
      capacity: 4,
      businessId: business.id,
    }
  });

  // Resumen de los datos creados en consola
  console.log('✅ Base de datos poblada con éxito:');
  console.log(`👤 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${rawPassword}`);
  console.log(`🛡️  Role: ${UserRole.SuperAdmin}`);
}

/**
 * Ejecución del seed con manejo de errores.
 * Si falla, imprime el error y termina el proceso con código 1.
 * Al finalizar (éxito o error), desconecta el cliente Prisma.
 */
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });