export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { getHandlers } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => (await getHandlers()).GET(req);
export const POST = async (req: NextRequest) => (await getHandlers()).POST(req);