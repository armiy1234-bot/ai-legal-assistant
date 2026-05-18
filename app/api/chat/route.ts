import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getMistralModel, LEGAL_SYSTEM_PROMPT } from '@/lib/ai/mistral-client';
import { sanitizePrompt, sanitizeResponse } from '@/lib/ai/prompt-guard';
import { ratelimit } from '@/lib/rate-limit';
import { getDb } from '@/lib/db';
import { legalQueries, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth'; // ✅ ИСПРАВЛЕНО: auth вместо getAuthSession

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // ✅ ИСПРАВЛЕНО: NextAuth v5 синтаксис
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await ratelimit.limit(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429 }
      );
    }

    const { message, category, useCoder } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 });
    }

    const { safe, cleaned, reason } = sanitizePrompt(message);
    if (!safe) {
      console.warn(`[PROMPT_GUARD] Blocked: ${reason}`, { userId: session.user.id });
      return NextResponse.json(
        { error: 'Запрос отклонён системой безопасности' },
        { status: 403 }
      );
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    const isPremium = user?.role === 'premium_user';
    const today = new Date().toISOString().split('T')[0];

    if (!isPremium && user?.lastQueryDate?.toISOString().split('T')[0] === today) {
      const freeLimit = parseInt(process.env.FREE_QUERIES_PER_DAY || '5');
      if ((user.dailyFreeQueries || 0) >= freeLimit) {
        return NextResponse.json(
          { error: 'Дневной лимит бесплатных запросов исчерпан' },
          { status: 403 }
        );
      }
    }

    // RAG fallback search
    const relevantCases = await db.query.courtCases.findMany({
      where: (cases, { sql, and, like }) =>
        and(
          like(cases.fullText, `%${cleaned.slice(0, 100)}%`),
          category ? like(cases.category, `%${category}%`) : undefined
        ),
      limit: 3,
    });

    const context = relevantCases.length > 0
      ? `📚 Найденные судебные дела:\n${relevantCases.map(c =>
          `- ${c.caseNumber} (${c.court}, ${c.decisionDate?.toISOString().split('T')[0]}):\n  ${c.summary || c.fullText?.slice(0, 200)}...`
        ).join('\n')}\n\n`
      : '';

    const model = getMistralModel(useCoder ? 'coder' : 'chat');

    const result = await streamText({
      model,
      system: LEGAL_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${context}Вопрос пользователя: ${cleaned}\n\nОтвечай строго по инструкции выше.`,
        },
      ],
      onFinish: async ({ text }) => {
        const sanitizedResponse = sanitizeResponse(text);
        await db.insert(legalQueries).values({
          userId: session.user.id,
          category,
          question: cleaned,
          aiResponse: sanitizedResponse,
          modelUsed: useCoder ? 'mistral-coder' : 'mistral-chat',
          tokensUsed: text.length,
          isPremium,
        });

        if (!isPremium) {
          const lastDate = user?.lastQueryDate?.toISOString().split('T')[0];
          const today = new Date().toISOString().split('T')[0];

          if (lastDate === today) {
            await db.update(users)
              .set({ dailyFreeQueries: (user.dailyFreeQueries || 0) + 1 })
              .where(eq(users.id, session.user.id));
          } else {
            await db.update(users)
              .set({ dailyFreeQueries: 1, lastQueryDate: new Date() })
              .where(eq(users.id, session.user.id));
          }
        }
      },
    });

    return result.toDataStreamResponse({
      headers: { 'X-Request-Id': crypto.randomUUID() },
    });

  } catch (error) {
    console.error('[CHAT_API] Error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}