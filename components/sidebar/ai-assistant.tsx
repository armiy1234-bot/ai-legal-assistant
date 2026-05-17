'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';
import { Bot, Send, Loader2, AlertTriangle } from 'lucide-react';

interface AiAssistantProps {
  defaultCategory?: string;
  compact?: boolean;
}

export function AiAssistant({ defaultCategory, compact = false }: AiAssistantProps) {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || '');
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      category: selectedCategory,
      useCoder: false, // Можно добавить переключатель для анализа документов
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const categories = [
    { value: '', label: '🔍 Общий вопрос' },
    { value: 'civil', label: '⚖️ Гражданское право' },
    { value: 'criminal', label: '🔒 Уголовное право' },
    { value: 'family', label: '👨‍👩‍👧 Семейное право' },
    { value: 'labor', label: '💼 Трудовое право' },
    { value: 'arbitration', label: '🏛️ Арбитраж' },
    { value: 'administrative', label: '📋 Административное' },
  ];

  if (compact) {
    return (
      <Card className="h-full flex flex-col border-r">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI-Юрист
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-2 space-y-2 overflow-hidden">
          <DisclaimerBanner compact />
          
          {/* Выбор категории */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.slice(0, 4).map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                className="text-xs whitespace-nowrap"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
          
          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ChatMessages messages={messages} isLoading={isLoading} />
          </div>
          
          {/* Форма ввода */}
          <form onSubmit={handleSubmit} className="flex gap-1 pt-1">
            <ChatInput
              value={input}
              onChange={handleInputChange}
              placeholder="Спросите о законе..."
              disabled={isLoading}
              compact
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
          
          {error && (
            <div className="text-xs text-destructive flex items-center gap-1 bg-destructive/10 p-2 rounded">
              <AlertTriangle className="w-3 h-3" />
              {error.message || 'Ошибка соединения'}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Полная версия для десктопа
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI-Юридический Ассистент
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Консультации на основе актуальной судебной практики РФ и СНГ
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <DisclaimerBanner />
        
        {/* Выбор категории */}
        <div>
          <label className="text-sm font-medium mb-2 block">Выберите отрасль права:</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                className="justify-start"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Чат */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-muted/30">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
        
        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            placeholder="Опишите вашу ситуацию..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        
        {/* Кнопка связи с юристом */}
        <Button variant="outline" className="w-full" onClick={() => {
          // Логика подключения к живому юристу
          alert('Функция подключения к юристу будет доступна после первого запроса к ИИ');
        }}>
          🤝 Связаться с юристом (первая консультация бесплатно)
        </Button>
        
        {error && (
          <div className="text-sm text-destructive flex items-center gap-2 bg-destructive/10 p-3 rounded">
            <AlertTriangle className="w-4 h-4" />
            {error.message || 'Произошла ошибка. Попробуйте позже.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}