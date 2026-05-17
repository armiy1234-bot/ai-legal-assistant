'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Shield, Zap, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'AI-консультации 24/7',
      description: 'Мгновенные ответы на юридические вопросы на основе судебной практики',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Актуальные данные',
      description: 'База обновляется раз в 2 недели: КАД.Арбитр, SudRF, Гарант',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Бесплатный старт',
      description: '5 бесплатных запросов в день + первая консультация с юристом',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Авторизация за секунду',
      description: 'Вход через ВКонтакте, Telegram или номер телефона',
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Герой-секция */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Юридическая помощь <span className="text-primary">на базе ИИ</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Получите консультацию по любому правовому вопросу РФ и СНГ. 
          Анализ судебной практики, рекомендации к действию, подключение к живому юристу.
        </p>
        
        {status === 'unauthenticated' ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Начать бесплатно</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Узнать больше</Link>
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={() => router.push('/dashboard')}>
            Перейти в личный кабинет
          </Button>
        )}
      </section>

      {/* Преимущества */}
      <section id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        {features.map((feature, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Отрасли права */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Работаем со всеми отраслями права</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['Гражданское', 'Уголовное', 'Семейное', 'Трудовое', 'Арбитраж', 'Административное'].map((cat) => (
            <Card key={cat} className="text-center hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <p className="font-medium">{cat}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Дисклеймер в футере */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p className="mb-2">
          ⚠️ Ответы ИИ не являются официальной юридической консультацией.
        </p>
        <p>
          © 2026 AI-Юрист. Все права защищены. 
          <Link href="/privacy" className="underline ml-2">Политика конфиденциальности</Link>
        </p>
      </footer>
    </div>
  );
}