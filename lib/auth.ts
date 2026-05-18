import NextAuth from "next-auth";
import { customFetch } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * VK ID OAuth 2.0 / 2.1 Provider для NextAuth v5
 * 
 * Документация: https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/websites/methods/auth
 * 
 * Важно:
 * - VK_CLIENT_ID = ID приложения из настроек VK ID
 * - VK_CLIENT_SECRET = "Защищённый ключ" из настроек приложения (длинная строка)
 * - Redirect URI в настройках VK: https://your-domain.com/api/auth/callback/vk
 */
function VKIDProvider(options: { 
  clientId: string; 
  clientSecret: string;
  deviceId: string | null;
  codeVerifier: string | null;
}) {
  return {
    id: "vk",
    name: "VK ID",
    type: "oauth" as const,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    checks: ["pkce", "state"] as ("pkce" | "state" | "none")[],
    
    // Authorization endpoint
    authorization: {
      url: "https://id.vk.com/authorize",
      params: {
        scope: "email",
        response_type: "code",
      },
    },
    
    // Token endpoint
    token: {
      url: "https://id.vk.com/oauth2/auth",
      async request({ params, provider }: any) {
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: provider.clientId,
          code: params.code,
          redirect_uri: provider.callbackUrl,
          code_verifier: options.codeVerifier || "",
          device_id: options.deviceId || "",
        });

        const response = await fetch(provider.token.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        const tokens = await response.json();
        
        if (tokens.error) {
          throw new Error(`VK ID token error: ${tokens.error_description || tokens.error}`);
        }
        
        return { tokens };
      },
    },
    
    // User info endpoint
    userinfo: {
      url: "https://id.vk.com/oauth2/user_info",
      async request({ tokens, provider }: any) {
        const response = await fetch(provider.userinfo.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: provider.clientId,
            access_token: tokens.access_token,
          }),
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(`VK ID userinfo error: ${data.error_description || data.error}`);
        }
        
        return data.user;
      },
    },
    
    // Profile mapping
    profile(profile: any) {
      return {
        id: profile.user_id?.toString() || profile.id?.toString(),
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.name,
        email: profile.email ?? null,
        image: profile.avatar || profile.photo_200 || null,
      };
    },
    
    style: { bg: "#0077FF", text: "#fff" },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
  let vkDeviceId: string | null = null;
  let vkCodeVerifier: string | null = null;

  // Извлекаем параметры из callback URL
  if (req) {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/callback/vk")) {
      vkDeviceId = url.searchParams.get("device_id");
      // PKCE code_verifier обычно хранится в cookies или state
      // NextAuth v5 должен автоматически управлять этим
    }
  }

  return {
    adapter: (supabaseUrl && supabaseKey)
      ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey })
      : undefined,
    providers: [
      VKIDProvider({
        clientId: process.env.VK_CLIENT_ID || "",
        clientSecret: process.env.VK_CLIENT_SECRET || "",
        deviceId: vkDeviceId,
        codeVerifier: vkCodeVerifier,
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
        // Сохраняем access_token для дальнейших запросов
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
        // Добавляем accessToken в сессию для API-запросов
        (session as any).accessToken = token.accessToken;
        return session;
      },
    },
    pages: { 
      signIn: "/login",
      error: "/login",
    },
    debug: process.env.NODE_ENV === "development",
  };
});
