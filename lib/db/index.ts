import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;

  if (process.env.NODE_ENV === 'production' && process.env.VERCEL && !process.env.DATABASE_URL) {
    _db = drizzle(postgres('postgresql://placeholder:placeholder@localhost:5432/placeholder', { max: 1 }), { schema });
    return _db;
  }

  const databaseUrl = process.env.DATABASE_URL;
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

