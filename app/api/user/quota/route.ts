import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.lastQueryDate?.toISOString().split('T')[0];
    const isPremium = user.role === 'premium_user';
    const limit = parseInt(process.env.FREE_QUERIES_PER_DAY || '5');

    return NextResponse.json({
      dailyFreeQueries: lastDate === today ? (user.dailyFreeQueries || 0) : 0,
      limit: isPremium ? 999 : limit,
      isPremium,
      remaining: isPremium ? 999 : Math.max(0, limit - (lastDate === today ? (user.dailyFreeQueries || 0) : 0)),
    });
  } catch (error) {
    console.error('[QUOTA_API] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
