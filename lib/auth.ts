import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const apiVersion = "5.131";

/**
 * VK OAuth Provider для NextAuth v5
 * VK не поддерживает PKCE, используем только state
 */
const VKProvider = {
  id: "vk",
  name: "VK",
  type: "oauth" as const,
  authorization: {
    url: "https://oauth.vk.com/authorize",
    params: {
      scope: "email",
      v: apiVersion,
      response_type: "code",
    },
  },
  token: {
    url: `https://oauth.vk.com/access_token?v=${apiVersion}`,
  },
  userinfo: {
    url: `https://api.vk.com/method/users.get?fields=photo_100&v=${apiVersion}`,
    async request({ tokens, provider }: any) {
      const url = new URL(provider.userinfo.url);
      url.searchParams.set("access_token", tokens.access_token);
      
      const response = await fetch(url.toString(), {
        headers: { "User-Agent": "authjs" },
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`VK API error: ${JSON.stringify(data.error)}`);
      }
      
      const profile = data.response?.[0];
      if (profile) {
        profile.email = tokens.email || null;
      }
      
      return profile;
    },
  },
  profile(profile: any) {
    return {
      id: profile.id?.toString(),
      name: [profile.first_name, profile.last_name].filter(Boolean).join(" "),
      email: profile.email ?? null,
      image: profile.photo_100 || null,
    };
  },
  style: { bg: "#07F", text: "#fff" },
  clientId: process.env.VK_CLIENT_ID || "",
  clientSecret: process.env.VK_CLIENT_SECRET || "",
  checks: ["state"] as ("pkce" | "state" | "none")[],
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: (supabaseUrl && supabaseKey)
    ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey })
    : undefined,
  providers: [
    VKProvider as any,
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
    maxAge: 30 * 24 * 60 * 60,
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
  debug: true,
});
