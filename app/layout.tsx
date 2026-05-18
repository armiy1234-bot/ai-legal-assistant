import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { AiAssistant } from '@/components/sidebar/ai-assistant';

const inter = Inter({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'LexAI — Юридическая помощь на базе искусственного интеллекта',
  description: 'Бесплатные юридические консультации на основе актуальной судебной практики РФ и СНГ. Анализ ситуации, рекомендации и пошаговый план действий.',
  keywords: ['юрист', 'юридическая консультация', 'судебная практика', 'ИИ', 'правовая помощь', 'LexAI'],
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
        </SessionProvider>
      </body>
    </html>
  );
}
