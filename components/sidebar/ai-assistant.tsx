'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { Scale, Send, Loader2, AlertTriangle, Sparkles, ChevronDown } from 'lucide-react';

interface AiAssistantProps {
  defaultCategory?: string;
  compact?: boolean;
}

export function AiAssistant({ defaultCategory, compact = false }: AiAssistantProps) {
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || '');
  const [showCategories, setShowCategories] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        category: selectedCategory,
        useCoder: false,
      },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const categories = [
    { value: '', label: 'Любая тема' },
    { value: 'civil', label: 'Гражданское' },
    { value: 'criminal', label: 'Уголовное' },
    { value: 'family', label: 'Семейное' },
    { value: 'labor', label: 'Трудовое' },
    { value: 'arbitration', label: 'Арбитраж' },
    { value: 'administrative', label: 'Административное' },
  ];

  const header = (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-sm">
        <Scale className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm">LexAI</h2>
        <p className="text-[11px] text-muted-foreground">Юридический ассистент</p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
        <Sparkles className="w-3 h-3" />
        Online
      </div>
    </div>
  );

  const categorySelector = (
    <div className="relative">
      <button
        onClick={() => setShowCategories(!showCategories)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-border/50 bg-muted/30"
      >
        <span>{categories.find(c => c.value === selectedCategory)?.label || 'Любая тема'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
      </button>
      {showCategories && (
        <div className="absolute top-full left-0 right-0 z-10 bg-card border border-border/50 rounded-b-xl shadow-apple-lg p-2 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setSelectedCategory(cat.value); setShowCategories(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="h-full flex flex-col">
        {header}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-muted/50 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Не является официальной консультацией
            </div>
            <ChatMessages messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border/50 p-3 bg-background/95 backdrop-blur-lg">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <ChatInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите о законе..."
                disabled={isLoading}
                compact
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="shrink-0 rounded-xl">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
            {error && (
              <div className="mt-2 text-[11px] text-destructive flex items-center gap-1.5 bg-destructive/5 px-3 py-2 rounded-xl">
                <AlertTriangle className="w-3 h-3" />
                {error.message || 'Ошибка соединения'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {header}
      {categorySelector}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-muted/50 text-xs text-muted-foreground leading-relaxed">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Ответы LexAI основаны на анализе судебной практики и не являются официальной юридической консультацией</span>
        </div>
        <ChatMessages messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-border/50 p-4 bg-background/95 backdrop-blur-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишите вашу ситуацию..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="shrink-0 rounded-xl px-4 gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Отправить</>}
          </Button>
        </form>
        {error && (
          <div className="mt-3 text-sm text-destructive flex items-center gap-2 bg-destructive/5 px-4 py-3 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
            {error.message || 'Произошла ошибка. Попробуйте позже.'}
          </div>
        )}
      </div>
    </div>
  );
}
