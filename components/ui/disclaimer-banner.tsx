import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Не является оф. консультацией
      </div>
    );
  }
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Важно:</strong> Ответы ИИ основаны на анализе открытых данных и не являются официальной юридической консультацией. 
          Для решения важных правовых вопросов обратитесь к лицензированному юристу. 
          Первая консультация с нашим специалистом — бесплатно.
        </p>
      </div>
    </div>
  );
}