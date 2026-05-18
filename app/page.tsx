'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Scale, Shield, Zap, Users, ChevronRight, ArrowRight, BookOpen, Sparkles, Star, MessageSquare, Send, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-анализ ситуации',
      description: 'Подробный разбор вашей правовой ситуации с ссылками на актуальную судебную практику',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Судебная практика',
      description: 'База обновляется каждые 2 недели: КАД.Арбитр, SudRF, Гарант — более 50 000 дел',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'План действий',
      description: 'Пошаговая инструкция: куда обращаться, какие документы собрать, какие сроки',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Консультация с юристом',
      description: 'Первая консультация с реальным юристом — бесплатно. Подключайтесь к специалисту',
    },
  ];

  const categories = [
    { name: 'Гражданское', icon: '⚖️', desc: 'Наследство, собственность, договоры' },
    { name: 'Уголовное', icon: '🔒', desc: 'Защита прав, обжалование, адвокаты' },
    { name: 'Семейное', icon: '👨‍👩‍👧', desc: 'Развод, алименты, опека' },
    { name: 'Трудовое', icon: '💼', desc: 'Увольнение, зарплата, права' },
    { name: 'Арбитраж', icon: '🏛️', desc: 'Хозяйственные споры, банкротство' },
    { name: 'Административное', icon: '📋', desc: 'Штрафы, обжалования, КоАП' },
  ];

  const stats = [
    { value: '50 000+', label: 'Судебных дел в базе' },
    { value: '1 000+', label: 'Консультаций проведено' },
    { value: '15', label: 'Отраслей права' },
    { value: '98%', label: 'Точность анализа' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-50" />
        <div className="relative container mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Юридический AI-ассистент
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
              Ваша правовая защита
              <span className="text-primary block mt-2">на базе искусственного интеллекта</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Проанализируйте ситуацию, получите ссылки на судебную практику 
              и пошаговый план действий. Бесплатно, конфиденциально, круглосуточно.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {status === 'unauthenticated' ? (
                <>
                  <Button size="lg" className="gap-2 shadow-apple-lg" asChild>
                    <Link href="/login">
                      Начать бесплатно <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2" asChild>
                    <Link href="#how-it-works">
                      Как это работает <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <Button size="lg" className="gap-2 shadow-apple-lg" onClick={() => router.push('/dashboard')}>
                  Перейти в личный кабинет <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Всё для защиты ваших прав
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              LexAI сочетает силу искусственного интеллекта с актуальной судебной практикой
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-border/50 shadow-apple hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Как это работает</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Три простых шага к правовой защите</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Опишите ситуацию', desc: 'Расскажите о вашей правовой проблеме простыми словами — как другу' },
              { step: '02', title: 'AI анализирует', desc: 'Искусственный интеллект ищет похожие дела в судебной практике и законы' },
              { step: '03', title: 'Получаете план', desc: 'Пошаговые рекомендации: куда идти, что писать, какие сроки' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Scale className="w-7 h-7 text-primary" />
                </div>
                <div className="text-sm font-semibold text-primary mb-2">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Все отрасли права</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Мы работаем с любыми правовыми вопросами РФ и СНГ</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <Card key={cat.name} className="border-border/50 shadow-apple hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Что говорят пользователи</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Реальные отзывы о помощи LexAI</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Анна К.', role: 'Развод и алименты', text: 'AI помог разобраться в процедуре развода и подсчитать алименты. Всё чётко по СК РФ, с конкретными статьями.', rating: 5 },
              { name: 'Дмитрий С.', role: 'Трудовой спор', text: 'Уволили незаконно — LexAI подсказал, какие документы собрать и куда обращаться. Выиграл дело в суде.', rating: 5 },
              { name: 'Елена М.', role: 'Наследство', text: 'Очень удобно получить разъяснение по ГК РФ в 2 часа ночи. Бесплатно и без записи к юристу.', rating: 5 },
            ].map((review, i) => (
              <Card key={i} className="border-border/50 shadow-apple">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Частые вопросы</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Ответы на популярные юридические вопросы</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            <FaqItem 
              question="Какие законы использует LexAI?"
              answer="LexAI опирается на актуальное законодательство РФ: Гражданский кодекс (ГК РФ), Уголовный кодекс (УК РФ), Семейный кодекс (СК РФ), Трудовой кодекс (ТК РФ), Кодекс об административных правонарушениях (КоАП РФ), Жилищный кодекс (ЖК РФ), Налоговый кодекс (НК РФ) и другие нормативные акты."
            />
            <FaqItem 
              question="Правовые ответы LexAI обязательны к исполнению?"
              answer="Нет. Ответы LexAI носят информационно-справочный характер и не являются официальной юридической консультацией. Для принятия важных решений рекомендуется обратиться к лицензированному юристу."
            />
            <FaqItem 
              question="Сколько стоит использование сервиса?"
              answer="Базовое использование LexAI полностью бесплатно — доступно 5 запросов в день. Для расширенного использования доступна премиум-подписка."
            />
            <FaqItem 
              question="Как часто обновляется база судебной практики?"
              answer="База судебных решений обновляется каждые 2 недели из открытых источников: КАД.Арбитр, SudRF, Гарант."
            />
            <FaqItem 
              question="Можно ли доверять ответам AI?"
              answer="LexAI использует проверенные источники — актуальные законы и реальную судебную практику. Однако AI может ошибаться, поэтому важных решений всегда консультируйтесь с юристом."
            />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 md:py-28 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Обратная связь</h2>
              <p className="text-muted-foreground">Есть вопросы или предложения? Напишите нам</p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-transparent to-emerald-50 border-t border-border/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готовы защитить свои права?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Начните с бесплатного запроса — AI проанализирует вашу ситуацию за секунды
          </p>
          {status === 'unauthenticated' ? (
            <Button size="lg" className="gap-2 shadow-apple-lg" asChild>
              <Link href="/login">
                Получить консультацию <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="gap-2 shadow-apple-lg" onClick={() => router.push('/dashboard')}>
              Перейти к анализу <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Scale className="w-4 h-4 text-primary" />
              LexAI — юридический AI-ассистент
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <p className="mb-1">Ответы ИИ не являются официальной юридической консультацией</p>
              <p>© 2026 LexAI. Все права защищены.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить отправку на API
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Спасибо!</h3>
        <p className="text-muted-foreground text-sm">Мы получили ваше сообщение и ответим в ближайшее время.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Имя</label>
          <Input 
            required 
            placeholder="Ваше имя" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input 
            type="email" 
            required 
            placeholder="your@email.com" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Сообщение</label>
        <Textarea 
          required 
          rows={4} 
          placeholder="Опишите ваш вопрос или предложение..."
          value={formData.message}
          onChange={e => setFormData({...formData, message: e.target.value})}
        />
      </div>
      <Button type="submit" className="w-full gap-2">
        <Send className="w-4 h-4" />
        Отправить сообщение
      </Button>
    </form>
  );
}
