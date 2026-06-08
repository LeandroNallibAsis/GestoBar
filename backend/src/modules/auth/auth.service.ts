import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
import type { User } from '@prisma/client';
import { authRepository } from './auth.repository';

const scrypt = promisify(scryptCallback);

// Service layer for authentication business logic.
// This module handles secure password hashing and credential validation.
export class AuthService {
  static async verifyCredentials(email: string, password: string): Promise<User> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatches = await this.verifyPassword(password, user.password);
    if (!passwordMatches) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, key] = storedHash.split(':');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return derivedKey.toString('hex') === key;
  }
}
