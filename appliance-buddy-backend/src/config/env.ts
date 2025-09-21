import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('appliance-buddy.db'),
  JWT_SECRET: z.string().min(32).default('default-jwt-secret-for-development-only-minimum-32-chars'),
  CORS_ORIGIN: z.string().default('*'),
  RAILWAY_ENVIRONMENT: z.string().optional(),
});

export const env = envSchema.parse(process.env);