import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Валидация переменных окружения
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL не задан. Проверьте переменные окружения в Vercel Dashboard.');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY не задан. Проверьте переменные окружения в Vercel Dashboard.');
}

const client = postgres(process.env.NEXT_PUBLIC_SUPABASE_URL!, {
  pass: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  max: 1,
});

export const db = drizzle(client, { schema });