import { NextAuthOptions } from "next-auth";
import VKProvider from "next-auth/providers/vk";
import EmailProvider from "next-auth/providers/email";

// 🛡️ Безопасная инициализация адаптера
// Адаптер создаётся ТОЛЬКО если URL и ключ существуют (т.е. на проде или локально)
let adapterConfig: any = undefined;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { SupabaseAdapter } = require("@auth/supabase-adapter");
  adapterConfig = SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

export const authOptions: NextAuthOptions = {
  adapter: adapterConfig,
  
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

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
  },

  pages: {
    signIn: "/login",
  },
  
  debug: process.env.NODE_ENV === "development",
};