'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BookOpen, Zap, Users, ChevronDown, ChevronUp, Phone, ExternalLink } from 'lucide-react';
import { ParsedLegalResponse } from '@/lib/response-parser';

interface LegalResponseCardsProps {
  parsedResponse: ParsedLegalResponse | null;
  isActive: boolean;
}

export function LegalResponseCards({ parsedResponse, isActive }: LegalResponseCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const cards = [
    {
      id: 'analysis',
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Анализ ситуации',
      content: parsedResponse?.summary || '',
      color: 'from-primary/10 to-emerald-50',
      textColor: 'text-primary',
    },
    {
      id: 'practice',
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Судебная практика',
      content: parsedResponse?.legalAnalysis || '',
      color: 'from-blue-500/10 to-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'plan',
      icon: <Zap className="w-6 h-6" />,
      title: 'План действий',
      content: parsedResponse?.actionPlan || '',
      color: 'from-amber-500/10 to-amber-50',
      textColor: 'text-amber-600',
    },
    {
      id: 'contact',
      icon: <Users className="w-6 h-6" />,
      title: 'Консультация с юристом',
      content: '',
      color: 'from-purple-500/10 to-purple-50',
      textColor: 'text-purple-600',
      isStatic: true,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const isExpanded = expandedCard === card.id;
        const hasContent = card.content && card.content.trim().length > 0;
        const isClickable = (isActive && hasContent) || card.isStatic;

        return (
          <div key={card.id} className="relative">
            <Card 
              className={`border-border/50 shadow-apple transition-all duration-300 ${
                isClickable 
                  ? 'hover:shadow-apple-lg hover:-translate-y-1 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              } ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}
              onClick={() => isClickable && toggleCard(card.id)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center ${card.textColor} mb-4`}>
                  {card.icon}
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  {card.title}
                  {isClickable && (
                    <span className="text-muted-foreground">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {card.isStatic ? (
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
                ) : !isActive ? (
                  <p className="text-sm text-muted-foreground">
                    Задайте вопрос, чтобы увидеть анализ
                  </p>
                ) : hasContent ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {card.content.substring(0, 120)}...
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Информация появится после анализа
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Expanded Content */}
            {isExpanded && hasContent && (
              <div className="mt-3 p-4 bg-card border border-border/50 rounded-xl shadow-apple animate-in slide-in-from-top-2">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {card.content}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard(card.id);
                  }}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ChevronUp className="w-3 h-3" />
                  Свернуть
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
