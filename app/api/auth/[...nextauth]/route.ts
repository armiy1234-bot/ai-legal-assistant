export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { getHandlers } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export const GET = (req: NextRequest) => getHandlers().GET(req);
export const POST = (req: NextRequest) => getHandlers().POST(req);