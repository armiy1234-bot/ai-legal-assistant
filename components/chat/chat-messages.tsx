'use client';

import { Bot, User, Loader2 } from 'lucide-react';

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
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <Bot className="w-8 h-8 mx-auto opacity-50" />
          <p className="text-sm">Задайте вопрос по законодательству РФ и СНГ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
          {msg.role === 'assistant' && (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
          <div
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
          {msg.role === 'user' && (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="bg-muted rounded-lg px-3 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
