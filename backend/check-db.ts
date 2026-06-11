import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.user.count();
    console.log(`Total usuarios en la BD: ${count}`);
    
    const admin = await prisma.user.findFirst({ where: { email: 'admin@gestobar.com' } });
    if (admin) {
      console.log('Usuario admin EXISTE:');
      console.log(`  ID: ${admin.id}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  isActive: ${admin.isActive}`);
      console.log(`  Password hash (primeros 30 chars): ${admin.password.substring(0, 30)}...`);
    } else {
      console.log('ERROR: El usuario admin@gestobar.com NO EXISTE en la BD.');
      console.log('Es necesario ejecutar el seed.');
    }
    
    const businesses = await prisma.business.count();
    console.log(`Total negocios en la BD: ${businesses}`);
  } catch (e) {
    console.error('Error conectando a la BD:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
