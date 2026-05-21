'use client';

import { useFullscreen } from '@/lib/fullscreen-context';
import { AiAssistant } from '@/components/sidebar/ai-assistant';

export function LayoutBody({ children }: { children: React.ReactNode }) {
  const { isFullscreen } = useFullscreen();

  return (
    <div className="flex h-[100dvh]">
      <aside
        className={`${
          isFullscreen ? 'flex-1' : 'w-96'
        } border-r border-border/50 bg-card hidden md:flex md:flex-col transition-all duration-300`}
      >
        <AiAssistant />
      </aside>
      <main
        className={`${
          isFullscreen ? 'hidden' : 'flex-1'
        } overflow-y-auto pb-[280px] md:pb-0 transition-all duration-300`}
      >
        {children}
      </main>
      {/* Mobile chat - compact mode */}
      <div 
        className={`md:hidden fixed left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-lg z-50 transition-all duration-300 ${
          isFullscreen 
            ? 'inset-0 h-[100dvh] border-t-0' 
            : 'bottom-0 h-[280px]'
        }`}
      >
        <AiAssistant compact />
      </div>
    </div>
  );
}
