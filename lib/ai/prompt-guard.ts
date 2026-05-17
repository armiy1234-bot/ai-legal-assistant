// Защита от prompt injection и вредоносных запросов
const DANGEROUS_PATTERNS = [
  /игнорируй.*инструкции?/i,
  /действуй.*как.*[а-яё]+/i,
  /забудь.*правила?/i,
  /системный.*промпт|system.*prompt/i,
  /покажи.*ключ|show.*key|api.*key/i,
  /выполни.*код|execute.*code|run.*script/i,
  /обойди.*ограничения?|bypass.*limit/i,
];

export function sanitizePrompt(input: string): { safe: boolean; cleaned: string; reason?: string } {
  let cleaned = input.trim();
  
  // Проверка на опасные паттерны
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(cleaned)) {
      return {
        safe: false,
        cleaned: input,
        reason: 'Запрос содержит потенциально опасную инструкцию',
      };
    }
  }
  
  // Базовая очистка от XSS
  cleaned = cleaned
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
  
  // Ограничение длины
  if (cleaned.length > 4000) {
    cleaned = cleaned.slice(0, 4000);
  }
  
  return { safe: true, cleaned };
}

export function sanitizeResponse(response: string): string {
  // Убираем возможные утечки системных промптов
  return response
    .replace(/системная.*инструкция|system.*instruction/i, '[скрыто]')
    .replace(/api[_-]?key|секретный.*ключ/i, '[скрыто]')
    .slice(0, 8000); // Лимит ответа
}