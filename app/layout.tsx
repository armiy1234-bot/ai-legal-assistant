import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/theme-provider';
import { I18nProvider } from '@/lib/i18n';
import { AiAssistant } from '@/components/sidebar/ai-assistant';

const inter = Inter({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'LexAI — Бесплатный юридический AI-помощник | Консультации 24/7',
  description: 'Бесплатные юридические консультации на основе актуальной судебной практики РФ и СНГ. AI-анализ ситуации, пошаговый план действий, ссылки на законы.',
  keywords: ['юридический помощник', 'бесплатная юридическая консультация', 'AI юрист', 'судебная практика', 'закон РФ', 'гражданское право', 'семейное право', 'трудовое право'],
  authors: [{ name: 'LexAI' }],
  creator: 'LexAI',
  publisher: 'LexAI',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://ai-legal-assistant-henna.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://ai-legal-assistant-henna.vercel.app',
    siteName: 'LexAI',
    title: 'LexAI — Бесплатный юридический AI-помощник',
    description: 'Бесплатные юридические консультации на основе актуальной судебной практики РФ и СНГ',
    images: [
      {
        url: 'https://ai-legal-assistant.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LexAI — Юридический AI-ассистент',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexAI — Бесплатный юридический AI-помощник',
    description: 'Бесплатные юридические консультации на основе актуальной судебной практики РФ и СНГ',
    images: ['https://ai-legal-assistant-henna.vercel.app/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <SessionProvider>
          <I18nProvider>
          <ThemeProvider>
          <div className="flex h-[100dvh]">
            <aside className="w-96 border-r border-border/50 bg-card hidden md:flex md:flex-col">
              <AiAssistant />
            </aside>
            <main className="flex-1 overflow-y-auto pb-[280px] md:pb-0">
              {children}
            </main>
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-[280px] border-t border-border/50 bg-background/95 backdrop-blur-lg z-50">
              <AiAssistant compact />
            </div>
          </div>
          </ThemeProvider>
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
