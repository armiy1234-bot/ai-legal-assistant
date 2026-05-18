import { NextAuthOptions, getServerSession } from "next-auth";
import VKProvider from "next-auth/providers/vk";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adapter = (supabaseUrl && supabaseKey)
  ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey })
  : undefined;

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    VKProvider({
      clientId: process.env.VK_CLIENT_ID || "",
      clientSecret: process.env.VK_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER || {
        host: "localhost",
        port: 1025,
        auth: { user: "test", pass: "test" },
      },
      from: process.env.EMAIL_FROM || "auth@example.com",
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV === "development",
};

// 🔧 Исправление: экспортируем getAuthSession, чтобы другие файлы не падали
export const getAuthSession = () => getServerSession(authOptions);