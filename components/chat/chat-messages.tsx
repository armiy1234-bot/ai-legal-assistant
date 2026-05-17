'use client';

import { Scale, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Чем могу помочь?</p>
            <p className="text-xs mt-1">Опишите вашу правовую ситуацию</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
            {['Развод и алименты', 'Незаконное увольнение', 'ДТП и страховка', 'Наследство'].map((hint) => (
              <span key={hint} className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground border border-border/50">
                {hint}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            msg.role === 'user'
              ? 'bg-gradient-to-br from-muted-foreground/20 to-muted'
              : 'bg-gradient-to-br from-primary/10 to-emerald-50'
          }`}>
            {msg.role === 'user' ? <User className="w-4 h-4 text-muted-foreground" /> : <Scale className="w-4 h-4 text-primary" />}
          </div>
          <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-md'
                : 'bg-muted/70 text-foreground rounded-tl-md border border-border/30'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            <p className={`text-[11px] text-muted-foreground mt-1 ${
              msg.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              {msg.role === 'user' ? 'Вы' : 'LexAI'}
            </p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-primary" />
          </div>
          <div className="inline-block rounded-2xl rounded-tl-md px-5 py-3.5 bg-muted/70 border border-border/30">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
