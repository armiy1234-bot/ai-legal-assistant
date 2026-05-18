'use client';

import { useTheme, type Theme } from '@/lib/theme-provider';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useState } from 'react';

const themes: { value: Theme; label: string; color: string }[] = [
  { value: 'emerald', label: 'Изумруд', color: 'bg-emerald-500' },
  { value: 'ocean', label: 'Океан', color: 'bg-blue-500' },
  { value: 'royal', label: 'Королевский', color: 'bg-violet-500' },
];

export function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Настройки темы"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Тема</span>
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border/50 rounded-xl shadow-apple-lg z-50 p-3 space-y-3">
            {/* Mode toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Режим</span>
              <button
                onClick={toggleMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors"
              >
                {mode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {mode === 'light' ? 'Светлый' : 'Тёмный'}
              </button>
            </div>
            
            <div className="border-t border-border/50" />
            
            {/* Theme colors */}
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium">Цветовая схема</span>
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTheme(t.value); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === t.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${t.color}`} />
                  {t.label}
                  {theme === t.value && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
