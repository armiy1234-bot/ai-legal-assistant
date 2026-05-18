import NextAuth from "next-auth";
import { customFetch } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const scopes = ["openid", "email"];

let _vkDeviceId: string | null = null;

export function setVKDeviceId(id: string | null) { _vkDeviceId = id; }

function VKIDProvider(options: { clientId: string; clientSecret: string }) {
  return {
    id: "vk",
    name: "VK ID",
    type: "oauth" as const,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    checks: ["pkce", "state"] as ("pkce" | "state" | "none")[],
    authorization: `https://id.vk.ru/authorize?scope=${scopes.join("+")}`,
    token: `https://id.vk.ru/oauth2/auth`,
    client: { token_endpoint_auth_method: "none" as const },
    [customFetch]: (url: RequestInfo | URL, init?: RequestInit) => {
      if (
        _vkDeviceId &&
        typeof url === "string" &&
        url.includes("/oauth2/auth") &&
        init?.body
      ) {
        const body = init.body as URLSearchParams;
        if (body.set) body.set("device_id", _vkDeviceId);
      }
      return fetch(url, init);
    },
    userinfo: {
      url: `https://id.vk.ru/oauth2/user_info`,
      async request({ tokens, provider }: any) {
        const res = await fetch(provider.userinfo?.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: provider.clientId,
            access_token: tokens.access_token,
          }),
        }).then((r) => r.json());
        return res.user;
      },
    },
    profile(profile: any) {
      return {
        id: profile.user_id,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" "),
        email: profile.email ?? null,
        image: profile.avatar,
      };
    },
    style: { bg: "#07F", text: "#fff" },
  };
}

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
