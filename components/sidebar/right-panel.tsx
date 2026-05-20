'use client';

import { usePathname } from 'next/navigation';
import { InfoPanel } from './info-panel';

export function RightPanel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return <InfoPanel />;
  }

  return <>{children}</>;
}
