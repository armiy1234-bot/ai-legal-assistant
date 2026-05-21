'use client';

import { createContext, useContext, useState, useCallback } from 'react';

type FullscreenContext = {
  isFullscreen: boolean;
  toggle: () => void;
};

const FullscreenCtx = createContext<FullscreenContext>({
  isFullscreen: false,
  toggle: () => {},
});

export function FullscreenProvider({ children }: { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggle = useCallback(() => setIsFullscreen((v) => !v), []);
  return (
    <FullscreenCtx.Provider value={{ isFullscreen, toggle }}>
      {children}
    </FullscreenCtx.Provider>
  );
}

export const useFullscreen = () => useContext(FullscreenCtx);
