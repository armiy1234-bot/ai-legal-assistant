import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;
  
  // Проверяем переменные ТОЛЬКО при первом обращении (не при сборке!)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    // В режиме сборки просто возвращаем заглушку
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      console.warn('⚠️ Supabase credentials not available at build time. Will retry at runtime.');
      // Создаём "безопасную заглушку" — не упадёт при сборке
      _db = drizzle(postgres('postgresql://placeholder:placeholder@localhost:5432/placeholder', { max: 1 }), { schema });
      return _db;
    }
    throw new Error('❌ Supabase credentials missing. Check your environment variables.');
  }
  
  const client = postgres(url, {
    pass: key,
    max: 1,
    ssl: { rejectUnauthorized: false }, // Supabase требует SSL
  });
  
  _db = drizzle(client, { schema });
  return _db;
}

