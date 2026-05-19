import NextAuth from "next-auth";
import VK from "next-auth/providers/vk";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: (supabaseUrl && supabaseKey)
    ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey })
    : undefined,
  providers: [
    VK({
      clientId: process.env.VK_CLIENT_ID || "",
      clientSecret: process.env.VK_CLIENT_SECRET || "",
      checks: ["state"], // VK не поддерживает PKCE, только state
    }),
    ...(process.env.EMAIL_SERVER
      ? [
          EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM || "noreply@lexai.ru",
          }),
        ]
      : []),
  ],
  session: { 
    strategy: "jwt", 
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: { 
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});
