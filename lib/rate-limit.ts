import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstashEnv = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  && process.env.UPSTASH_REDIS_REST_URL !== 'https://your-redis.upstash.io';

const createRatelimit = () => {
  if (!hasUpstashEnv) {
    const store = new Map<string, { count: number; reset: number }>();
    // Очистка устаревших записей каждые 10 минут
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (now > entry.reset) store.delete(key);
      }
    }, 600000);
    return {
      limit: async (id: string) => {
        const now = Date.now();
        const key = `${id}:${new Date().toISOString().split('T')[0]}`;
        const entry = store.get(key);
        if (!entry || now > entry.reset) {
          store.set(key, { count: 1, reset: now + 86400000 });
          return { success: true, limit: 30, remaining: 29, reset: now + 86400000 };
        }
        entry.count++;
        const success = entry.count <= 30;
        return { success, limit: 30, remaining: Math.max(0, 30 - entry.count), reset: entry.reset };
      },
    };
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 d'),
    analytics: true,
  });
};

export const ratelimit = createRatelimit();
