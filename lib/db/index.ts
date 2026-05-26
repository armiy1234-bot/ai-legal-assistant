import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error('❌ DATABASE_URL missing. Check your environment variables.');
  }

  const client = postgres(databaseUrl, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  _db = drizzle(client, { schema });
  return _db;
}

