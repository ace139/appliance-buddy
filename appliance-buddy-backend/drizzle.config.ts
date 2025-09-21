import type { Config } from 'drizzle-kit';
import { env } from './src/config/env';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_URL || 'appliance-buddy.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;