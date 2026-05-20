'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Scale, Sparkles, BookOpen, Zap, Users, ArrowRight, Star, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: <Sparkles className="w-[13px] h-[13px]" />, title: 'AI-анализ' },
  { icon: <BookOpen className="w-[13px] h-[13px]" />, title: 'Судебная практика' },
  { icon: <Zap className="w-[13px] h-[13px]" />, title: 'План действий' },
  { icon: <Users className="w-[13px] h-[13px]" />, title: 'Консультация' },
];

const categories = [
  'Гражданское', 'Уголовное', 'Семейное', 'Трудовое', 'Арбитраж', 'Административное'
];

const stats = [
  { value: '50K+', label: 'дел' },
  { value: '1K+', label: 'консультаций' },
  { value: '15', label: 'отраслей' },
  { value: '98%', label: 'точность' },
];

export function InfoPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      {/* Hero / Auth CTA */}
      <div className="px-[13px] pt-[13px] pb-[8px]">
        <div className="flex items-center gap-[8px] mb-[8px]">
          <div className="w-[21px] h-[21px] rounded-md bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <Scale className="w-[13px] h-[13px] text-white" />
          </div>
          <span className="text-[13px] font-semibold">LexAI</span>
        </div>
        {status === 'unauthenticated' ? (
          <Link
            href="/login"
            className="flex items-center justify-center gap-[5px] w-full h-[34px] rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors"
          >
            Начать бесплатно <ArrowRight className="w-[8px] h-[8px]" />
          </Link>
        ) : (
          <div className="flex items-center gap-[5px] px-[8px] py-[5px] rounded-lg bg-primary/5 text-[11px] text-primary">
            <div className="w-[5px] h-[5px] rounded-full bg-green-500" />
            Авторизован
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mx-[8px] mb-[8px] p-[8px] rounded-lg bg-card border border-border/30">
        <div className="grid grid-cols-4 gap-[5px]">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[13px] font-bold text-primary leading-none mb-[2px]">{s.value}</div>
              <div className="text-[8px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mx-[8px] mb-[8px]">
        <div className="grid grid-cols-2 gap-[5px]">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-[5px] p-[8px] rounded-lg bg-card border border-border/30">
              <div className="w-[21px] h-[21px] rounded-md bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center text-primary">
                {f.icon}
              </div>
              <span className="text-[10px] font-medium leading-tight text-foreground">{f.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mx-[8px] mb-[8px]">
        <div className="flex flex-wrap gap-[3px]">
          {categories.map((c) => (
            <span key={c} className="px-[5px] py-[2px] rounded-md bg-muted text-[9px] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="mx-[8px] mb-[8px] p-[8px] rounded-lg bg-card border border-border/30">
        <div className="flex gap-[2px] mb-[3px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-[8px] h-[8px] fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground leading-relaxed">
          "AI помог разобраться в процедуре развода. Всё чётко по СК РФ."
        </p>
        <p className="text-[8px] font-medium mt-[3px]">— Анна К.</p>
      </div>

      {/* Footer */}
      <div className="px-[13px] py-[8px] border-t border-border/20">
        <p className="text-[8px] text-muted-foreground text-center leading-relaxed">
          Ответы ИИ не являются официальной консультацией
        </p>
        <p className="text-[8px] text-muted-foreground text-center mt-[2px]">
          © 2026 LexAI
        </p>
      </div>
    </div>
  );
}
