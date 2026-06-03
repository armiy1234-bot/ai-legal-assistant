import NextAuth from "next-auth";
import NodemailerProvider from "next-auth/providers/nodemailer";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";

function VKIDProvider(options: { 
  clientId: string; 
  clientSecret: string;
}) {
  return {
    id: "vk",
    name: "VK ID",
    type: "oauth" as const,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    checks: ["pkce"] as ("pkce" | "state" | "none")[],
    authorization: {
      url: "https://id.vk.com/authorize",
      params: {
        scope: "email phone",
        response_type: "code",
      },
    },
    token: {
      url: "https://id.vk.com/oauth2/auth",
      async request({ params, provider }: any) {
        // Read device_id from request headers (set by middleware.ts on callback)
        const reqHeaders = headers();
        const deviceId = reqHeaders.get("x-vk-device-id")
          || params.device_id
          || "";
        const state = reqHeaders.get("x-vk-state")
          || params.state
          || "";

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
          code: params.code,
          redirect_uri: provider.callbackUrl,
          code_verifier: params.code_verifier,
          device_id: deviceId,
          state: state,
        });
        
        console.log("[VK OAuth] Token request — device_id:", deviceId ? `${deviceId.substring(0,20)}...` : "MISSING");
        
        const res = await fetch(provider.token.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        
        const rawText = await res.text();
        
        // VK returns HTTP 200 even on errors — check body for error field
        let json: any;
        try {
          json = JSON.parse(rawText);
        } catch {
          console.error("[VK OAuth] Non-JSON response:", rawText.substring(0, 500));
          throw new Error(`Token request returned non-JSON: ${rawText.substring(0, 200)}`);
        }
        
        if (json.error) {
          console.error("[VK OAuth] VK error response:", json);
          throw new Error(`VK token error: ${json.error} — ${json.error_description}`);
        }
        
        if (!res.ok) {
          console.error("[VK OAuth] HTTP error:", res.status, rawText.substring(0, 500));
          throw new Error(`Token request failed: HTTP ${res.status}`);
        }
        
        console.log("[VK OAuth] Token response keys:", Object.keys(json));
        
        // Strip id_token — VK uses non-standard JWT fields (iis/app vs iss/aud)
        const { id_token, ...cleanJson } = json;
        return Response.json(cleanJson);
      },
    },
    userinfo: {
      url: "https://id.vk.com/oauth2/user_info",
      async request({ tokens, provider }: any) {
        const res = await fetch(provider.userinfo.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: provider.clientId,
            access_token: tokens.access_token,
          }),
        });
        
        if (!res.ok) {
          const error = await res.text();
          console.error("[VK OAuth] Userinfo error:", error);
          throw new Error(`Userinfo request failed: ${error}`);
        }
        
        const json = await res.json();
        return json.user;
      },
    },
    profile(profile: any) {
      return {
        id: profile.user_id,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null,
        email: profile.email ?? null,
        image: profile.avatar ?? null,
        phone: profile.phone ?? null,
      };
    },
    style: { bg: "#07F", text: "#fff" },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  return {
    providers: [
      // Custom VK OAuth provider (may not work due to AuthJS internals — see /api/auth/vk)
      VKIDProvider({
        clientId: process.env.VK_CLIENT_ID || "",
        clientSecret: process.env.VK_CLIENT_SECRET || "",
      }),
      // Credentials provider for standalone VK auth flow
      Credentials({
        id: "vk-custom",
        name: "VK Custom",
        credentials: {
          userId: { label: "User ID", type: "text" },
        },
        async authorize(credentials) {
          if (!credentials?.userId) return null;
          try {
            const db = getDb();
            const user = await db.query.users.findFirst({
              where: eq(usersTable.id, credentials.userId as string),
            });
            if (!user) return null;
            return {
              id: user.id,
              name: user.name || undefined,
              email: user.email || undefined,
              image: user.avatar || undefined,
            };
          } catch (err) {
            console.error("[vk-custom] DB lookup failed:", err);
            return null;
          }
        },
      }),
      Google((process.env.OAUTH_GOOGLE_CLIENT_ID && process.env.OAUTH_GOOGLE_CLIENT_SECRET) ? {
        clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      } : {}),
      ...(process.env.EMAIL_SERVER
        ? [
            NodemailerProvider({
              server: process.env.EMAIL_SERVER,
              from: process.env.EMAIL_FROM || "noreply@lexai.ru",
            }),
          ]
        : []),
    ],
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    callbacks: {
      async jwt({ token, account, profile }) {
        if (account && profile) {
          let dbUser;
          try {
            const db = getDb();
            if (account.provider === "vk") {
              dbUser = await db.query.users.findFirst({
                where: eq(usersTable.vkId, String(profile.user_id)),
              });
              if (!dbUser) {
                const [created] = await db.insert(usersTable).values({
                  vkId: String(profile.user_id),
                  phone: (profile as any).phone || null,
                  email: profile.email || null,
                  name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null,
                  avatar: profile.avatar || null,
                } as any).returning();
                dbUser = created;
              } else {
                // Обновляем существующего пользователя
                await db.update(usersTable)
                  .set({
                    email: profile.email || dbUser.email,
                    name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || dbUser.name,
                    avatar: profile.avatar || dbUser.avatar || null,
                    phone: (profile as any).phone || dbUser.phone,
                  } as any)
                  .where(eq(usersTable.id, dbUser.id));
              }
            } else if (account.provider === "google") {
              const email = profile.email || account.providerAccountId;
              dbUser = await db.query.users.findFirst({
                where: eq(usersTable.email, email),
              });
              if (!dbUser) {
                const [created] = await db.insert(usersTable).values({
                  email: email,
                  name: profile.name || null,
                  avatar: profile.image || null,
                } as any).returning();
                dbUser = created;
              } else {
                await db.update(usersTable)
                  .set({
                    name: profile.name || dbUser.name,
                    avatar: profile.image || dbUser.avatar || null,
                  } as any)
                  .where(eq(usersTable.id, dbUser.id));
              }
            }
          } catch (dbErr) {
        console.error("[auth:jwt] DB error during sign-in:", dbErr);
      }
          if (dbUser) {
            token.sub = dbUser.id;
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (token.sub && session.user) session.user.id = token.sub;
        return session;
      },
    },
    pages: { signIn: "/login" },
    debug: true,
  };
});
