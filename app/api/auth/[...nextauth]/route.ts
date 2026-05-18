// ✅ NextAuth v5: просто экспортируем handlers как GET/POST
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
