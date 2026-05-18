import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const apiVersion = "5.131";

// ✅ Кастомный VK ID провайдер
function VKIDProvider(options: { clientId: string; clientSecret: string }) {
  return {
    id: "vk",
    name: "VK ID",
    type: "oauth" as const,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorization: `https://id.vk.com/authorize?scope=openid+email&v=${apiVersion}`,
    token: `https://oauth.vk.com/access_token?v=${apiVersion}`,
    client: { token_endpoint_auth_method: "client_secret_post" as const },
    userinfo: {
      url: `https://api.vk.com/method/users.get?fields=photo_100&v=${apiVersion}`,
      async request({ tokens, provider }: any) {
        const res = await fetch(provider.userinfo?.url, {
          headers: { Authorization: `Bearer ${tokens.access_token}`, "User-Agent": "authjs" },
        }).then((r) => r.json());
        res.response[0].email = tokens.email ?? null;
        return res.response[0];
      },
    },
    profile(profile: any) {
      return {
        id: profile.id,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" "),
        email: profile.email ?? null,
        image: profile.photo_100,
      };
    },
    style: { bg: "#07F", text: "#fff" },
  };
}

// ✅ Синтаксис NextAuth v5: экспортируем handlers и auth
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: (supabaseUrl && supabaseKey)
    ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey })
    : undefined,
  providers: [
    VKIDProvider({
      clientId: process.env.VK_CLIENT_ID || "",
      clientSecret: process.env.VK_CLIENT_SECRET || "",
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
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV === "development",
});