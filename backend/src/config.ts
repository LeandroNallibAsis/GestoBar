import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env in development.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET ?? 'change_this_secret',
  databaseUrl: process.env.DATABASE_URL ?? ''
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required in environment variables');
}

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is required in environment variables');
}
