import { PrismaClient, UserRole, TableStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Crear Comercio
  const business = await prisma.business.create({
    data: {
      name: 'GestoBar Demo Store',
      users: {
        create: {
          email: 'admin@gestobar.com',
          password: hashedPassword,
          name: 'Admin Demo',
          role: UserRole.BusinessOwner,
        },
      },
    },
  });

  console.log('Comercio y usuario admin creados');

  // 2. Crear Categorías y Productos
  const catComida = await prisma.category.create({
    data: { name: 'Comidas', businessId: business.id }
  });

  await prisma.product.createMany({
    data: [
      { name: 'Hamburguesa Plus', price: 1200, stock: 50, businessId: business.id, categoryId: catComida.id },
      { name: 'Papas Fritas', price: 600, stock: 100, businessId: business.id, categoryId: catComida.id },
    ]
  });

  // 3. Crear Mesas
  await prisma.table.createMany({
    data: [
      { name: 'Mesa 1', capacity: 2, status: TableStatus.FREE, businessId: business.id },
      { name: 'Mesa 2', capacity: 4, status: TableStatus.OCCUPIED, businessId: business.id },
      { name: 'Mesa 3', capacity: 4, status: TableStatus.PENDING_PAYMENT, businessId: business.id },
    ]
  });

  console.log('Datos de prueba insertados con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });