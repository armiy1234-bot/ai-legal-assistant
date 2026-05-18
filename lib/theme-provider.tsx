'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'emerald' | 'ocean' | 'royal';
export type Mode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: Mode;
  setTheme: (t: Theme) => void;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS: Record<Theme, { primary: string; primaryForeground: string; secondary: string; secondaryForeground: string; accent: string; accentForeground: string; ring: string }> = {
  emerald: {
    primary: '160 84% 39%',
    primaryForeground: '0 0% 100%',
    secondary: '160 30% 95%',
    secondaryForeground: '160 50% 20%',
    accent: '160 30% 95%',
    accentForeground: '160 50% 20%',
    ring: '160 84% 39%',
  },
  ocean: {
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '217 30% 95%',
    secondaryForeground: '217 50% 20%',
    accent: '217 30% 95%',
    accentForeground: '217 50% 20%',
    ring: '217 91% 60%',
  },
  royal: {
    primary: '263 70% 50%',
    primaryForeground: '0 0% 100%',
    secondary: '263 30% 95%',
    secondaryForeground: '263 50% 20%',
    accent: '263 30% 95%',
    accentForeground: '263 50% 20%',
    ring: '263 70% 50%',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('emerald');
  const [mode, setModeState] = useState<Mode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('lexai-theme') as Theme | null;
    const savedMode = localStorage.getItem('lexai-mode') as Mode | null;
    if (savedTheme && ['emerald', 'ocean', 'royal'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      setModeState(savedMode);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setModeState('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const colors = THEME_COLORS[theme];
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.accentForeground);
    root.style.setProperty('--ring', colors.ring);
    
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    
    localStorage.setItem('lexai-theme', theme);
    localStorage.setItem('lexai-mode', mode);
  }, [theme, mode, mounted]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setMode = (m: Mode) => setModeState(m);
  const toggleMode = () => setModeState(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
