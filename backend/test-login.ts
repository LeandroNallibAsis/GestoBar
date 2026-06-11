import { PrismaClient } from '@prisma/client';
import { AuthService } from './src/modules/auth/auth.service';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'admin@gestobar.com';
    const password = 'admin123';
    
    console.log(`Buscando usuario con email: ${email}`);
    const user = await prisma.user.findFirst({ where: { email } });
    
    if (!user) {
      console.log('Error: Usuario NO ENCONTRADO en la base de datos.');
      console.log('¿Ejecutaste "pnpm -F gestobar-backend prisma db seed"?');
      return;
    }
    
    console.log(`Usuario encontrado. ID: ${user.id}`);
    console.log(`Hash almacenado: ${user.password}`);
    
    const isValid = await AuthService.verifyPassword(user.password, password);
    console.log(`Resultado de verifyPassword: ${isValid}`);
    
    if (isValid) {
      console.log('El login DEBERÍA funcionar. La verificación de contraseña fue exitosa.');
    } else {
      console.log('Error: La verificación de contraseña FALLÓ.');
    }
  } catch (error) {
    console.error('Ocurrió un error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
