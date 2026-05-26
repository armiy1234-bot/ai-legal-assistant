import NextAuth from "next-auth";
import NodemailerProvider from "next-auth/providers/nodemailer";
import Google from "next-auth/providers/google";
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
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: provider.clientId,
          code: params.code,
          redirect_uri: provider.callbackUrl,
          code_verifier: params.code_verifier,
        });
        
        const res = await fetch(provider.token.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        
        if (!res.ok) {
          const error = await res.text();
          console.error("[VK OAuth] Token error:", error);
          throw new Error(`Token request failed: ${error}`);
        }
        
        return res;
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
      VKIDProvider({
        clientId: process.env.VK_CLIENT_ID || "",
        clientSecret: process.env.VK_CLIENT_SECRET || "",
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
                    avatar: profile.avatar || dbUser.avatar,
                    phone: (profile as any).phone || dbUser.phone,
                  })
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
                }).returning();
                dbUser = created;
              } else {
                await db.update(usersTable)
                  .set({
                    name: profile.name || dbUser.name,
                    avatar: profile.image || dbUser.avatar,
                  })
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
