import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
        <AlertTriangle className="w-3 h-3" />
        Не является оф. консультацией
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-900/80 leading-relaxed">
          <strong className="text-amber-900">Важно:</strong> Ответы LexAI основаны на анализе открытых данных судебной практики
          и не являются официальной юридической консультацией. Для решения важных правовых вопросов
          обратитесь к лицензированному юристу. Первая консультация с нашим специалистом — бесплатно.
        </div>
      </div>
    </div>
  );
}
