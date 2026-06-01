import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, legalQueries, lawyerConsultations, usageLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileClient } from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const db = getDb();
  const userId = session.user.id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    redirect("/login");
  }

  const [queries, consultations, logs] = await Promise.all([
    db.query.legalQueries.findMany({
      where: eq(legalQueries.userId, userId),
      orderBy: (legalQueries, { desc }) => [desc(legalQueries.createdAt)],
      limit: 50,
    }),
    db.query.lawyerConsultations.findMany({
      where: eq(lawyerConsultations.userId, userId),
      orderBy: (lawyerConsultations, { desc }) => [desc(lawyerConsultations.createdAt)],
      limit: 20,
    }),
    db.query.usageLogs.findMany({
      where: eq(usageLogs.userId, userId),
      orderBy: (usageLogs, { desc }) => [desc(usageLogs.timestamp)],
      limit: 20,
    }),
  ]);

  const toISO = (d: Date | null | undefined) => d?.toISOString() ?? null;

  const userData = {
    profile: {
      id: user.id,
      vkId: user.vkId,
      telegramId: user.telegramId,
      phone: user.phone,
      role: user.role,
      dailyFreeQueries: user.dailyFreeQueries,
      lastQueryDate: toISO(user.lastQueryDate),
      createdAt: toISO(user.createdAt),
    },
    queries: queries.map(q => ({
      id: q.id,
      category: q.category,
      question: q.question,
      aiResponse: q.aiResponse,
      modelUsed: q.modelUsed,
      tokensUsed: q.tokensUsed,
      isPremium: q.isPremium,
      createdAt: toISO(q.createdAt),
    })),
    consultations: consultations.map(c => ({
      id: c.id,
      status: c.status ?? "pending",
      lawyerId: c.lawyerId,
      scheduledAt: toISO(c.scheduledAt),
      createdAt: toISO(c.createdAt),
    })),
    logs: logs.map(l => ({
      id: l.id,
      endpoint: l.endpoint,
      timestamp: toISO(l.timestamp),
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Личный кабинет</h1>
        <ProfileClient initialData={userData} />
      </div>
    </div>
  );
}
