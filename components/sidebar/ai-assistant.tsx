'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { Scale, Send, Loader2, AlertTriangle, Sparkles, ChevronDown, FileText, Heart, Briefcase, Shield, Home, Car, Gavel, Building2, Download, LogOut, Maximize2, Minimize2 } from 'lucide-react';
import { categories as legalCategories, getCategoryById } from '@/lib/categories';
import { QueryCounter } from '@/components/query-counter';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useSession, signOut } from 'next-auth/react';
import { TextStreamChatTransport } from 'ai';
import { useFullscreen } from '@/lib/fullscreen-context';
import { useChatResponse } from '@/lib/chat-response-context';
import { parseLegalResponse } from '@/lib/response-parser';

interface AiAssistantProps {
  defaultCategory?: string;
  compact?: boolean;
}

export function AiAssistant({ defaultCategory, compact = false }: AiAssistantProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || '');
  const [showCategories, setShowCategories] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/chat',
      body: {
        category: selectedCategory,
        useCoder: false,
      },
    }),
  });

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { setLastResponse } = useChatResponse();
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse AI response and update context
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && 'text' in lastMessage) {
      const text = String(lastMessage.text);
      const parsed = parseLegalResponse(text);
      if (parsed.summary || parsed.legalAnalysis || parsed.actionPlan) {
        setLastResponse(parsed);
      }
    }
  }, [messages, setLastResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const exportToPDF = () => {
    if (messages.length === 0) return;
    const content = messages.map(m => {
      const role = m.role === 'user' ? 'Вы' : 'LexAI';
      const text = 'text' in m ? String(m.text) : JSON.stringify(m);
      return `${role}:\n${text}\n`;
    }).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lexai-consultation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const iconMap: Record<string, React.ReactNode> = {
    FileText: <FileText className="w-3.5 h-3.5" />,
    Heart: <Heart className="w-3.5 h-3.5" />,
    Briefcase: <Briefcase className="w-3.5 h-3.5" />,
    Shield: <Shield className="w-3.5 h-3.5" />,
    Home: <Home className="w-3.5 h-3.5" />,
    Car: <Car className="w-3.5 h-3.5" />,
    Gavel: <Gavel className="w-3.5 h-3.5" />,
    Building2: <Building2 className="w-3.5 h-3.5" />,
  };

  const header = (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-sm">
        <Scale className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm">LexAI</h2>
        <p className="text-[11px] text-muted-foreground">Юридический ассистент</p>
      </div>
      <div className="flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeSwitcher />
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={isFullscreen ? 'Свернуть чат' : 'Развернуть чат'}
        >
          {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        {session?.user?.id && (
          <>
            <QueryCounter userId={session.user.id} />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Выйти"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </>
        )}
        {messages.length > 0 && (
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Сохранить консультацию"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Сохранить</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
          <Sparkles className="w-3 h-3" />
          Online
        </div>
      </div>
    </div>
  );

  const categorySelector = (
    <div className="relative">
      <button
        onClick={() => setShowCategories(!showCategories)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-border/50 bg-muted/30"
      >
        <span className="flex items-center gap-2">
          {selectedCategory ? (
            <>
              <span className={`w-2 h-2 rounded-full ${getCategoryById(selectedCategory)?.color || 'bg-primary'}`} />
              {getCategoryById(selectedCategory)?.label || 'Любая тема'}
            </>
          ) : 'Любая тема'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
      </button>
      {showCategories && (
        <div className="absolute top-full left-0 right-0 z-10 bg-card border border-border/50 rounded-b-xl shadow-apple-lg p-2 space-y-1 max-h-64 overflow-y-auto">
          <button
            onClick={() => { setSelectedCategory(''); setShowCategories(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === ''
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Любая тема
          </button>
          {legalCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setShowCategories(false); }}
              className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const containerClass = `h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`;

  if (compact) {
    return (
      <div ref={chatContainerRef} className={containerClass}>
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
    <div ref={chatContainerRef} className={containerClass}>
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
