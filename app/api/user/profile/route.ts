import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users, legalQueries, lawyerConsultations, usageLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const userId = session.user.id;

    // Получаем данные пользователя
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Получаем историю запросов
    const queries = await db.query.legalQueries.findMany({
      where: eq(legalQueries.userId, userId),
      orderBy: (legalQueries, { desc }) => [desc(legalQueries.createdAt)],
      limit: 50,
    });

    // Получаем консультации
    const consultations = await db.query.lawyerConsultations.findMany({
      where: eq(lawyerConsultations.userId, userId),
      orderBy: (lawyerConsultations, { desc }) => [desc(lawyerConsultations.createdAt)],
      limit: 20,
    });

    // Получаем логи
    const logs = await db.query.usageLogs.findMany({
      where: eq(usageLogs.userId, userId),
      orderBy: (usageLogs, { desc }) => [desc(usageLogs.timestamp)],
      limit: 20,
    });

    return NextResponse.json({
      profile: {
        id: user.id,
        vkId: user.vkId,
        telegramId: user.telegramId,
        phone: user.phone,
        role: user.role,
        dailyFreeQueries: user.dailyFreeQueries,
        lastQueryDate: user.lastQueryDate,
        createdAt: user.createdAt,
      },
      queries: queries.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        aiResponse: q.aiResponse,
        modelUsed: q.modelUsed,
        tokensUsed: q.tokensUsed,
        isPremium: q.isPremium,
        createdAt: q.createdAt,
      })),
      consultations: consultations.map(c => ({
        id: c.id,
        status: c.status,
        lawyerId: c.lawyerId,
        scheduledAt: c.scheduledAt,
        createdAt: c.createdAt,
      })),
      logs: logs.map(l => ({
        id: l.id,
        endpoint: l.endpoint,
        timestamp: l.timestamp,
      })),
    });

  } catch (error) {
    console.error("[API /user/profile] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
