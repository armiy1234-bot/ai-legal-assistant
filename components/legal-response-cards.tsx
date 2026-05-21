'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BookOpen, Zap, Users, Phone, ExternalLink } from 'lucide-react';

export function LegalResponseCards() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: AI-Анализ ситуации */}
      <Card className="border-border/50 shadow-apple transition-all duration-300 opacity-60 cursor-not-allowed">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center text-primary mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">AI-Анализ ситуации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Задайте вопрос, чтобы увидеть анализ
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Судебная практика */}
      <Card className="border-border/50 shadow-apple transition-all duration-300 opacity-60 cursor-not-allowed">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-50 flex items-center justify-center text-blue-600 mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">Судебная практика</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Задайте вопрос, чтобы увидеть анализ
          </p>
        </CardContent>
      </Card>

      {/* Card 3: План действий */}
      <Card className="border-border/50 shadow-apple transition-all duration-300 opacity-60 cursor-not-allowed">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-50 flex items-center justify-center text-amber-600 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">План действий</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Задайте вопрос, чтобы увидеть анализ
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Консультация с юристом — интерактивная */}
      <Card className="border-border/50 shadow-apple transition-all duration-300 hover:shadow-apple-lg hover:-translate-y-1 cursor-pointer">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-50 flex items-center justify-center text-purple-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">Консультация с юристом</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <a 
                href="tel:+79617407483" 
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                +7 (961) 740-74-83
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-primary" />
              <a 
                href="https://vk.com/legaldecision19" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Группа VK
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Первая консультация — бесплатно
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
