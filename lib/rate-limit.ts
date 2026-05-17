import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstashEnv = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  && process.env.UPSTASH_REDIS_REST_URL !== 'https://your-redis.upstash.io';

const createRatelimit = () => {
  if (!hasUpstashEnv) {
    const store = new Map<string, { count: number; reset: number }>();
    return {
      limit: async (id: string) => {
        const now = Date.now();
        const key = `${id}:${new Date().toISOString().split('T')[0]}`;
        const entry = store.get(key) || { count: 0, reset: now + 86400000 };
        if (now > entry.reset) {
          store.set(key, { count: 1, reset: now + 86400000 });
          return { success: true };
        }
        entry.count++;
        store.set(key, entry);
        return { success: entry.count <= 30 };
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
