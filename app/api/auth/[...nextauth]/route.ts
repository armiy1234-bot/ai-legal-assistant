export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { getHandlers } from '@/lib/auth';

const { GET, POST } = getHandlers();

export { GET, POST };