'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

type FullscreenContext = {
  isFullscreen: boolean;
  toggle: () => void;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
};

const FullscreenCtx = createContext<FullscreenContext>({
  isFullscreen: false,
  toggle: () => {},
  enterFullscreen: async () => {},
  exitFullscreen: async () => {},
});

export function FullscreenProvider({ children }: { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Check if browser supports fullscreen API
  const isFullscreenSupported = typeof document !== 'undefined' && 
    (document.documentElement.requestFullscreen || 
     (document.documentElement as any).webkitRequestFullscreen);

  const enterFullscreen = useCallback(async () => {
    try {
      // Try native fullscreen API first
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn('Fullscreen API failed, using CSS fallback:', err);
      // Fallback: use CSS class for mobile
      setIsFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
      setIsFullscreen(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Listen for fullscreen changes (ESC key, etc.)
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || 
        !!(document as any).webkitFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
    };
  }, []);

  return (
    <FullscreenCtx.Provider value={{ isFullscreen, toggle, enterFullscreen, exitFullscreen }}>
      {children}
    </FullscreenCtx.Provider>
  );
}

export const useFullscreen = () => useContext(FullscreenCtx);
