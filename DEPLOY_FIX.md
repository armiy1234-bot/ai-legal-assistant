# Исправления для деплоя LexAI

## Что было исправлено

### 1. lib/auth.ts
- Убран неправильный импорт `customFetch` из `next-auth`
- Заменено на `customFetch` как свойство объекта провайдера

### 2. lib/db/index.ts
- Убран placeholder для production (Vercel)
- Добавлена поддержка POSTGRES_URL как fallback

### 3. Созданы недостающие компоненты
- `components/ui/skeleton.tsx` — для loading состояний
- `components/ui/badge.tsx` — для отображения статусов

### 4. app/profile/page.tsx
- Исправлена ошибка с `sessionToken` (свойство не существует в типе Session)

## Следующие шаги

1. Закоммитить изменения:
   ```bash
   git add -A
   git commit -m "fix: TypeScript errors, auth imports, db connection"
   git push origin master
   ```

2. Задеплоить на Vercel:
   ```bash
   npx vercel --prod
   ```

3. Проверить webhook:
   ```
   GET https://ai-legal-assistant-henna.vercel.app/api/webhooks/sync
   ```

4. Настроить переменные окружения в Vercel Dashboard:
   - SYNC_WEBHOOK_SECRET
   - DATABASE_URL или POSTGRES_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
