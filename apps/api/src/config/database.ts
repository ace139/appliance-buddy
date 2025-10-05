import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema';
import { env } from './env';

const sqlite = new Database(env.DATABASE_URL || 'appliance-buddy.db');

export const db = drizzle(sqlite, { schema });

export { schema };