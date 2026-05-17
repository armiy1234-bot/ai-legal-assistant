import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { AiAssistant } from '@/components/sidebar/ai-assistant';

const inter = Inter({ subsets: ['cyrillic', 'latin'] });

export const metadata: Metadata = {
  title: 'AI-Юрист — Юридическая помощь на базе ИИ',
  description: 'Бесплатные юридические консультации на основе актуальной судебной практики РФ и СНГ. Авторизация через ВК, Telegram, телефон.',
  keywords: ['юрист', 'юридическая консультация', 'судебная практика', 'ИИ', 'правовая помощь'],
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
          <div className="flex h-screen">
            {/* Боковая панель с ИИ — всегда доступна */}
            <aside className="w-80 border-r hidden md:block">
              <AiAssistant />
            </aside>
            
            {/* Основной контент */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
            
            {/* Мобильная версия: ИИ в нижнем листе */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
              <AiAssistant compact />
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}