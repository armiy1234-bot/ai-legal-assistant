'use client';

import { useI18n, type Locale } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';
import { useState } from 'react';

const locales: { value: Locale; label: string; flag: string }[] = [
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Выбор языка"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{locale === 'ru' ? 'Русский' : 'English'}</span>
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border/50 rounded-xl shadow-apple-lg z-50 p-1.5">
            {locales.map((l) => (
              <button
                key={l.value}
                onClick={() => { setLocale(l.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  locale === l.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="text-base">{l.flag}</span>
                {l.label}
                {locale === l.value && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
