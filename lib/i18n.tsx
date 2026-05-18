'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Locale = 'ru' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  ru: {
    'app.title': 'LexAI — Юридическая помощь на базе искусственного интеллекта',
    'app.description': 'Бесплатные юридические консультации на основе актуальной судебной практики РФ и СНГ',
    'hero.badge': 'Юридический AI-ассистент',
    'hero.title': 'Ваша правовая защита',
    'hero.subtitle': 'на базе искусственного интеллекта',
    'hero.description': 'Проанализируйте ситуацию, получите ссылки на судебную практику и пошаговый план действий. Бесплатно, конфиденциально, круглосуточно.',
    'hero.cta.start': 'Начать бесплатно',
    'hero.cta.how': 'Как это работает',
    'stats.cases': 'Судебных дел в базе',
    'stats.consultations': 'Консультаций проведено',
    'stats.areas': 'Отраслей права',
    'stats.accuracy': 'Точность анализа',
    'features.title': 'Всё для защиты ваших прав',
    'features.subtitle': 'LexAI сочетает силу искусственного интеллекта с актуальной судебной практикой',
    'feature.ai': 'AI-анализ ситуации',
    'feature.ai.desc': 'Подробный разбор вашей правовой ситуации с ссылками на актуальную судебную практику',
    'feature.practice': 'Судебная практика',
    'feature.practice.desc': 'База обновляется каждые 2 недели: КАД.Арбитр, SudRF, Гарант — более 50 000 дел',
    'feature.plan': 'План действий',
    'feature.plan.desc': 'Пошаговая инструкция: куда обращаться, какие документы собрать, какие сроки',
    'feature.lawyer': 'Консультация с юристом',
    'feature.lawyer.desc': 'Первая консультация с реальным юристом — бесплатно. Подключайтесь к специалисту',
    'how.title': 'Как это работает',
    'how.subtitle': 'Три простых шага к правовой защите',
    'how.step1': 'Опишите ситуацию',
    'how.step1.desc': 'Расскажите о вашей правовой проблеме простыми словами — как другу',
    'how.step2': 'AI анализирует',
    'how.step2.desc': 'Искусственный интеллект ищет похожие дела в судебной практике и законы',
    'how.step3': 'Получаете план',
    'how.step3.desc': 'Пошаговые рекомендации: куда идти, что писать, какие сроки',
    'categories.title': 'Все отрасли права',
    'categories.subtitle': 'Мы работаем с любыми правовыми вопросами РФ и СНГ',
    'category.civil': 'Гражданское',
    'category.civil.desc': 'Наследство, собственность, договоры',
    'category.criminal': 'Уголовное',
    'category.criminal.desc': 'Защита прав, обжалование, адвокаты',
    'category.family': 'Семейное',
    'category.family.desc': 'Развод, алименты, опека',
    'category.labor': 'Трудовое',
    'category.labor.desc': 'Увольнение, зарплата, права',
    'category.arbitration': 'Арбитраж',
    'category.arbitration.desc': 'Хозяйственные споры, банкротство',
    'category.administrative': 'Административное',
    'category.administrative.desc': 'Штрафы, обжалования, КоАП',
    'cta.title': 'Готовы защитить свои права?',
    'cta.desc': 'Начните с бесплатного запроса — AI проанализирует вашу ситуацию за секунды',
    'cta.button': 'Получить консультацию',
    'footer.disclaimer': 'Ответы ИИ не являются официальной юридической консультацией',
    'footer.copyright': '© 2026 LexAI. Все права защищены.',
    'chat.placeholder': 'Опишите вашу ситуацию...',
    'chat.placeholder.compact': 'Спросите о законе...',
    'chat.send': 'Отправить',
    'chat.online': 'Online',
    'chat.disclaimer': 'Ответы LexAI основаны на анализе судебной практики и не являются официальной юридической консультацией',
    'chat.empty': 'Чем могу помочь?',
    'chat.empty.hint': 'Опишите вашу правовую ситуацию',
    'theme.label': 'Тема',
    'theme.light': 'Светлый',
    'theme.dark': 'Тёмный',
    'login.title': 'Вход в LexAI',
    'login.desc': 'Войдите, чтобы получить доступ к AI-консультациям',
    'login.vk': 'Войти через VK ID',
    'login.email': 'Войти по Email',
    'login.terms': 'условиями использования',
    'nav.back': 'На главную',
    'dashboard.title': 'Личный кабинет',
  },
  en: {
    'app.title': 'LexAI — AI-Powered Legal Assistance',
    'app.description': 'Free legal consultations based on up-to-date case law of Russia and CIS',
    'hero.badge': 'AI Legal Assistant',
    'hero.title': 'Your Legal Protection',
    'hero.subtitle': 'powered by Artificial Intelligence',
    'hero.description': 'Analyze your situation, get references to case law and a step-by-step action plan. Free, confidential, 24/7.',
    'hero.cta.start': 'Start for free',
    'hero.cta.how': 'How it works',
    'stats.cases': 'Court cases in database',
    'stats.consultations': 'Consultations conducted',
    'stats.areas': 'Areas of law',
    'stats.accuracy': 'Analysis accuracy',
    'features.title': 'Everything to protect your rights',
    'features.subtitle': 'LexAI combines AI power with up-to-date case law',
    'feature.ai': 'AI Situation Analysis',
    'feature.ai.desc': 'Detailed review of your legal situation with references to current case law',
    'feature.practice': 'Case Law',
    'feature.practice.desc': 'Database updated every 2 weeks: over 50,000 cases',
    'feature.plan': 'Action Plan',
    'feature.plan.desc': 'Step-by-step instructions: where to go, what documents to collect, deadlines',
    'feature.lawyer': 'Lawyer Consultation',
    'feature.lawyer.desc': 'First consultation with a real lawyer — free',
    'how.title': 'How it works',
    'how.subtitle': 'Three simple steps to legal protection',
    'how.step1': 'Describe the situation',
    'how.step1.desc': 'Tell us about your legal problem in simple words',
    'how.step2': 'AI analyzes',
    'how.step2.desc': 'Artificial intelligence searches for similar cases and laws',
    'how.step3': 'Get a plan',
    'how.step3.desc': 'Step-by-step recommendations: where to go, what to write, deadlines',
    'categories.title': 'All Areas of Law',
    'categories.subtitle': 'We handle any legal issues in Russia and CIS',
    'category.civil': 'Civil',
    'category.civil.desc': 'Inheritance, property, contracts',
    'category.criminal': 'Criminal',
    'category.criminal.desc': 'Rights protection, appeals, attorneys',
    'category.family': 'Family',
    'category.family.desc': 'Divorce, alimony, custody',
    'category.labor': 'Labor',
    'category.labor.desc': 'Dismissal, salary, rights',
    'category.arbitration': 'Arbitration',
    'category.arbitration.desc': 'Commercial disputes, bankruptcy',
    'category.administrative': 'Administrative',
    'category.administrative.desc': 'Fines, appeals, administrative code',
    'cta.title': 'Ready to protect your rights?',
    'cta.desc': 'Start with a free request — AI will analyze your situation in seconds',
    'cta.button': 'Get consultation',
    'footer.disclaimer': 'AI responses are not official legal advice',
    'footer.copyright': '© 2026 LexAI. All rights reserved.',
    'chat.placeholder': 'Describe your situation...',
    'chat.placeholder.compact': 'Ask about the law...',
    'chat.send': 'Send',
    'chat.online': 'Online',
    'chat.disclaimer': 'LexAI responses are based on case law analysis and are not official legal advice',
    'chat.empty': 'How can I help?',
    'chat.empty.hint': 'Describe your legal situation',
    'theme.label': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'login.title': 'Sign in to LexAI',
    'login.desc': 'Sign in to access AI consultations',
    'login.vk': 'Sign in with VK ID',
    'login.email': 'Sign in with Email',
    'login.terms': 'terms of service',
    'nav.back': 'Back to home',
    'dashboard.title': 'Dashboard',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ru');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('lexai-locale') as Locale | null;
    if (saved && ['ru', 'en'].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lexai-locale', locale);
    document.documentElement.lang = locale;
  }, [locale, mounted]);

  const setLocale = (l: Locale) => setLocaleState(l);

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
