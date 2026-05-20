import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getMistralModel, LEGAL_SYSTEM_PROMPT } from '@/lib/ai/mistral-client';
import { getCategoryById } from '@/lib/categories';
import { sanitizePrompt, sanitizeResponse } from '@/lib/ai/prompt-guard';
import { ratelimit } from '@/lib/rate-limit';
import { getDb } from '@/lib/db';
import { legalQueries, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth'; // ✅ ИСПРАВЛЕНО: auth вместо getAuthSession

export const maxDuration = 60;

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

    const body = await req.json();
    let message: string;
    let category = body.category;
    let useCoder = body.useCoder;

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      const lastUserMsg = [...body.messages].reverse().find((m: any) => m.role === "user");
      if (!lastUserMsg) {
        return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 });
      }
      if (lastUserMsg.content && typeof lastUserMsg.content === "string") {
        message = lastUserMsg.content;
      } else if (lastUserMsg.parts?.[0]?.text) {
        message = lastUserMsg.parts[0].text;
      } else {
        return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 });
      }
    } else if (typeof body.message === "string") {
      message = body.message;
    } else {
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

    let isPremium = false;
    let user: any = null;
    let relevantCases: any[] = [];
    try {
      const db = getDb();
      user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });
      isPremium = user?.role === 'premium_user';
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

      relevantCases = await db.query.courtCases.findMany({
        where: (cases, { sql, and, like }) =>
          and(
            like(cases.fullText, `%${cleaned.slice(0, 100)}%`),
            category ? like(cases.category, `%${category}%`) : undefined
          ),
        limit: 3,
      });
    } catch (dbErr) {
      console.error('[CHAT_DB] DB error, continuing without DB:', dbErr);
    }

    const context = relevantCases.length > 0
      ? `📚 Найденные судебные дела:\n${relevantCases.map(c =>
          `- ${c.caseNumber} (${c.court}, ${c.decisionDate?.toISOString().split('T')[0]}):\n  ${c.summary || c.fullText?.slice(0, 200)}...`
        ).join('\n')}\n\n`
      : '';

    const model = getMistralModel(useCoder ? 'coder' : 'chat');
    const categoryData = category ? getCategoryById(category) : null;
    const categoryPrompt = categoryData ? `\n\nКАТЕГОРИЯ: ${categoryData.label}. ${categoryData.prompt}` : '';

    const result = await streamText({
      model,
      system: LEGAL_SYSTEM_PROMPT,
      maxRetries: 2,
      messages: [
        {
          role: 'user',
          content: `${context}${categoryPrompt}\n\nВопрос пользователя: ${cleaned}\n\nОтвечай строго по инструкции выше.`,
        },
      ],
      onFinish: async ({ text }) => {
        try {
          const sanitizedResponse = sanitizeResponse(text);
          const db = getDb();
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
                .set({ dailyFreeQueries: (user!.dailyFreeQueries || 0) + 1 })
                .where(eq(users.id, session.user.id));
            } else {
              await db.update(users)
                .set({ dailyFreeQueries: 1, lastQueryDate: new Date() })
                .where(eq(users.id, session.user.id));
            }
          }
        } catch (dbErr) {
          console.error('[CHAT_DB] onFinish DB error:', dbErr);
        }
      },
    });

    return result.toDataStreamResponse({
      headers: { 'X-Request-Id': crypto.randomUUID() },
    });

  } catch (error: any) {
    console.error('[CHAT_API] Error:', error);
    // Обработка специфических ошибок Mistral
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Сервис временно перегружен. Попробуйте через минуту.' },
        { status: 503 }
      );
    }
    if (error?.status >= 500 || error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Ошибка соединения с AI-сервисом. Повторите запрос.' },
        { status: 502 }
      );
    }
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'AI-сервис не ответил вовремя. Попробуйте сократить вопрос.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}