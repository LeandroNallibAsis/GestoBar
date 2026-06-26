/**
 * ============================================================
 * auth.service.ts
 * ============================================================
 * Servicio de autenticación del sistema GestoBar.
 * Contiene la lógica de negocio para el hasheo y verificación
 * de contraseñas, así como la validación de credenciales de
 * inicio de sesión.
 *
 * Utiliza el algoritmo scrypt (derivación de claves) para
 * almacenar contraseñas de forma segura con un salt aleatorio.
 *
 * Tabla(s) relacionada(s): User
 * Módulo: Autenticación (auth)
 * ============================================================
 */

import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { authRepository } from './auth.repository';
import type { User } from '@prisma/client';

/** Versión promisificada de scrypt para usar con async/await */
const scryptAsync = promisify(scrypt);

/**
 * Servicio estático de autenticación.
 * Proporciona métodos para hashear contraseñas, verificarlas
 * y validar las credenciales completas de un usuario.
 */
export class AuthService {
  /**
   * Hashea una contraseña usando scrypt.
   * Formato de salida: salt.hash (en hexadecimal)
   *
   * @param password - Contraseña en texto plano a hashear
   * @returns Cadena con formato "salt.hash" en hexadecimal
   */
  static async hashPassword(password: string): Promise<string> {
    // Genera un salt aleatorio de 16 bytes para evitar ataques de tablas arcoíris
    const salt = randomBytes(16).toString('hex');
    // Deriva una clave de 64 bytes usando scrypt con el salt generado
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}.${buf.toString('hex')}`;
  }

  /**
   * Verifica si una contraseña coincide con el hash almacenado.
   * Usa comparación de tiempo constante (timingSafeEqual) para
   * prevenir ataques de temporización (timing attacks).
   *
   * @param storedHash - Hash almacenado en formato "salt.hash"
   * @param suppliedPassword - Contraseña proporcionada por el usuario
   * @returns true si la contraseña coincide, false en caso contrario
   */
  static async verifyPassword(storedHash: string, suppliedPassword: string): Promise<boolean> {
    // Separa el salt del hash almacenado
    const [salt, hash] = storedHash.split('.');
    // Genera el hash de la contraseña proporcionada usando el mismo salt
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    
    // Comparación segura en tiempo constante para prevenir timing attacks
    return timingSafeEqual(Buffer.from(hash, 'hex'), buf);
  }

  /**
   * Verifica el email y la contraseña de un usuario.
   * Busca al usuario por email y luego valida su contraseña.
   * Lanza un error genérico si el email no existe o la contraseña
   * es incorrecta (para no revelar cuál campo es inválido).
   *
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña en texto plano
   * @returns Objeto User completo si las credenciales son válidas
   * @throws Error si el email no existe o la contraseña es incorrecta
   */
  static async verifyCredentials(email: string, password: string): Promise<User> {
    // Busca el usuario por email en la base de datos
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Mensaje genérico para no revelar si el email existe
      throw new Error('Invalid email or password');
    }
    // Verifica que la contraseña proporcionada coincida con el hash almacenado
    const isPasswordValid = await this.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    return user;
  }
}