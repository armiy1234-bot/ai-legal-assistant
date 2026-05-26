import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    
    // Проверка авторизации (только admin)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    
    // Получаем всех пользователей с полными данными
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    return NextResponse.json({
      total: allUsers.length,
      users: allUsers.map(u => ({
        id: u.id,
        vkId: u.vkId,
        telegramId: u.telegramId,
        phone: u.phone,
        email: u.email,
        name: u.name,
        avatar: u.avatar,
        role: u.role,
        dailyFreeQueries: u.dailyFreeQueries,
        lastQueryDate: u.lastQueryDate,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("[admin/users] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
