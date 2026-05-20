import NextAuth from "next-auth";
import { customFetch } from "next-auth";
import NodemailerProvider from "next-auth/providers/nodemailer";
import Google from "next-auth/providers/google";

function VKIDProvider(options: { 
  clientId: string; 
  clientSecret: string; 
  deviceId: string | null;
  state: string | null;
  extId: string | null;
}) {
  return {
    id: "vk",
    name: "VK ID",
    type: "oauth" as const,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    checks: ["pkce"] as ("pkce" | "state" | "none")[],
    authorization: "https://id.vk.ru/authorize?scope=email,phone",
    token: "https://id.vk.ru/oauth2/auth",
    client: { token_endpoint_auth_method: "none" as const },
    [customFetch]: (url: RequestInfo | URL, init?: RequestInit) => {
      if (String(url).includes("/oauth2/auth") && init?.body) {
        let bodyStr: string;
        if (typeof init.body === "string") {
          bodyStr = init.body;
        } else if (init.body instanceof URLSearchParams) {
          bodyStr = init.body.toString();
        } else {
          return fetch(url, init);
        }
        const params = new URLSearchParams(bodyStr);
        if (options.deviceId) {
          params.set("device_id", options.deviceId);
        }
        const stateVal = (options.state || options.extId || "");
        if (stateVal) {
          params.set("state", stateVal);
        }
        init.body = params.toString();
      }
      return fetch(url, init);
    },
    userinfo: {
      url: "https://id.vk.ru/oauth2/user_info",
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
        phone: profile.phone ?? null,
      };
    },
    style: { bg: "#07F", text: "#fff" },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
  let vkDeviceId: string | null = null;
  let vkState: string | null = null;
  let vkExtId: string | null = null;

  if (req) {
    try {
      const url = new URL(req.url);
      if (url.pathname.includes("/callback/vk")) {
        vkDeviceId = url.searchParams.get("device_id");
        vkState = url.searchParams.get("state");
        vkExtId = url.searchParams.get("ext_id");
      }
    } catch {}
  }

  return {
    providers: [
      VKIDProvider({
        clientId: process.env.VK_CLIENT_ID || "",
        clientSecret: process.env.VK_CLIENT_SECRET || "",
        deviceId: vkDeviceId,
        state: vkState,
        extId: vkExtId,
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
      async session({ session, token }) {
        if (token.sub && session.user) session.user.id = token.sub;
        return session;
      },
      async signIn({ account, profile }) {
        if (account?.provider === "google") {
          return true;
        }
        return true;
      },
    },
    events: {
      async error(error) {
        console.error("[auth:error]", error?.message || error);
        if (error?.cause) {
          console.error("[auth:error:cause]", error.cause);
        }
      },
    },
    pages: { signIn: "/login" },
    debug: true,
  };
});
