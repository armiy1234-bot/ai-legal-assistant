'use client';

import { useEffect, useState } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

interface QueryCounterProps {
  userId: string;
}

export function QueryCounter({ userId }: QueryCounterProps) {
  const [count, setCount] = useState<number | null>(null);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    // Получаем из localStorage для быстрого отображения
    const saved = localStorage.getItem(`queries_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (data.date === today) {
        setCount(data.count);
      } else {
        setCount(0);
      }
    } else {
      setCount(0);
    }

    // Запрашиваем актуальные данные с сервера
    fetch('/api/user/quota')
      .then(r => r.json())
      .then(data => {
        if (data.dailyFreeQueries !== undefined) {
          setCount(data.dailyFreeQueries);
          setLimit(data.limit || 5);
          localStorage.setItem(`queries_${userId}`, JSON.stringify({
            count: data.dailyFreeQueries,
            date: new Date().toISOString().split('T')[0]
          }));
        }
      })
      .catch(() => {});
  }, [userId]);

  if (count === null) return null;

  const remaining = Math.max(0, limit - count);
  const percentage = (remaining / limit) * 100;
  const isLow = remaining <= 1;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isLow 
        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
        : 'bg-primary/10 text-primary'
    }`}>
      {isLow ? <AlertTriangle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
      <span>{remaining} / {limit} бесплатно</span>
      <div className="w-12 h-1.5 bg-background rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${isLow ? 'bg-amber-500' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
