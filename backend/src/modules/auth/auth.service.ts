import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { authRepository } from './auth.repository';
import type { User } from '@prisma/client';

const scryptAsync = promisify(scrypt);

export class AuthService {
  /**
   * Hashea una contraseña usando scrypt.
   * Formato de salida: salt.hash (en hexadecimal)
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}.${buf.toString('hex')}`;
  }

  /**
   * Verifica si una contraseña coincide con el hash almacenado.
   */
  static async verifyPassword(storedHash: string, suppliedPassword: string): Promise<boolean> {
    const [salt, hash] = storedHash.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    
    return timingSafeEqual(Buffer.from(hash, 'hex'), buf);
  }

  /**
   * Verifica el email y la contraseña de un usuario.
   */
  static async verifyCredentials(email: string, password: string): Promise<User> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isPasswordValid = await this.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    return user;
  }
}