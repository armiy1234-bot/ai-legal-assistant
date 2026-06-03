import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { signIn } from "@/lib/auth";
import {
  generatePKCE,
  generateState,
  generateDeviceId,
  buildAuthUrl,
  exchangeCode,
  getUserInfo,
} from "@/lib/vk-oauth";

/**
 * Standalone VK ID OAuth handler — bypasses AuthJS's OAuth internals.
 *
 * GET /api/auth/vk          → redirect to VK authorize (login)
 * GET /api/auth/vk?code=... → exchange code, sign in via credentials provider
 */

const COOKIE_PREFIX = process.env.NODE_ENV === "production"
  ? "__Secure-authjs"
  : "authjs";

function getVkClientInfo() {
  const clientId = process.env.VK_CLIENT_ID;
  const clientSecret = process.env.VK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("VK_CLIENT_ID or VK_CLIENT_SECRET not configured");
  }
  return { clientId, clientSecret };
}

function getSiteUrl() {
  return process.env.NEXTAUTH_URL || "https://ai-legal-assistant-henna.vercel.app";
}

async function upsertUser(profile: {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}): Promise<string> {
  const db = getDb();
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;

  const existing = await db.query.users.findFirst({
    where: eq(usersTable.vkId, profile.userId),
  });

  if (existing) {
    await db.update(usersTable)
      .set({
        email: profile.email || existing.email,
        name: name || existing.name,
        avatar: profile.avatar || existing.avatar || null,
        phone: profile.phone || existing.phone,
      } as any)
      .where(eq(usersTable.id, existing.id));
    return existing.id;
  }

  const [created] = await db.insert(usersTable).values({
    vkId: profile.userId,
    phone: profile.phone || null,
    email: profile.email || null,
    name,
    avatar: profile.avatar || null,
  } as any).returning();
  return created.id;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const VK_CALLBACK_URL = `${getSiteUrl()}/api/auth/vk`;

  try {
    // === STEP 1: Redirect to VK (no code param) ===
    if (!code) {
      const pkce = generatePKCE();
      const state = generateState();
      const deviceId = generateDeviceId();

      const authUrl = buildAuthUrl({
        clientId: getVkClientInfo().clientId,
        redirectUri: VK_CALLBACK_URL,
        codeChallenge: pkce.challenge,
        state,
        deviceId,
      });

      const response = NextResponse.redirect(authUrl);

      // Store PKCE verifier, state, and device_id for callback
      const cookieOpts = {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 900,
      };

      response.cookies.set(`${COOKIE_PREFIX}.vk.code_verifier`, pkce.verifier, cookieOpts);
      response.cookies.set(`${COOKIE_PREFIX}.vk.state`, state, cookieOpts);
      response.cookies.set(`${COOKIE_PREFIX}.vk.device_id`, deviceId, cookieOpts);

      console.log("[VK OAuth] Redirecting to VK, device_id:", deviceId.substring(0, 20) + "...");

      return response;
    }

    // === STEP 2: Handle callback (code param present) ===
    const clientInfo = getVkClientInfo();
    const vkDeviceId = url.searchParams.get("device_id") || "";
    const state = url.searchParams.get("state") || "";
    const error = url.searchParams.get("error");
    const errorDesc = url.searchParams.get("error_description");

    console.log("[VK OAuth] Callback:", {
      hasCode: !!code,
      vkDeviceId: vkDeviceId.substring(0, 20) + "...",
      state,
      error: error || "none",
    });

    if (error) {
      console.error("[VK OAuth] Auth error:", error, errorDesc);
      return NextResponse.redirect(`${getSiteUrl()}/login?error=${encodeURIComponent(errorDesc || error)}`);
    }

    // Read stored PKCE verifier and our device_id from cookies
    const storedVerifier = request.cookies.get(`${COOKIE_PREFIX}.vk.code_verifier`)?.value || "";
    const storedDeviceId = request.cookies.get(`${COOKIE_PREFIX}.vk.device_id`)?.value || "";
    const storedState = request.cookies.get(`${COOKIE_PREFIX}.vk.state`)?.value || "";

    console.log("[VK OAuth] Stored device_id:", storedDeviceId.substring(0, 20) + "...",
      "has_verifier:", !!storedVerifier);

    // Exchange code for tokens — use device_id from VK callback
    const tokenResponse = await exchangeCode({
      clientId: clientInfo.clientId,
      clientSecret: clientInfo.clientSecret,
      redirectUri: VK_CALLBACK_URL,
      code,
      codeVerifier: storedVerifier,
      deviceId: vkDeviceId || storedDeviceId,
      state: state || storedState,
    });

    if (!tokenResponse.access_token) {
      throw new Error("No access_token in VK response");
    }

    console.log("[VK OAuth] Got access_token, fetching userinfo...");

    // Fetch user info
    const userInfo = await getUserInfo(
      tokenResponse.access_token,
      clientInfo.clientId,
    );

    console.log("[VK OAuth] User:", {
      userId: userInfo.user_id,
      name: [userInfo.first_name, userInfo.last_name].filter(Boolean).join(" "),
      hasEmail: !!userInfo.email,
    });

    // Upsert user in DB
    const dbUserId = await upsertUser({
      userId: String(userInfo.user_id),
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      email: userInfo.email,
      phone: userInfo.phone,
      avatar: userInfo.avatar,
    });

    console.log("[VK OAuth] DB user:", dbUserId);

    // Sign in using NextAuth credentials provider (creates proper session cookie)
    await signIn("vk-custom", {
      userId: dbUserId,
      redirect: false,
    });

    console.log("[VK OAuth] signIn complete, redirecting to dashboard");

    const redirect = NextResponse.redirect(`${getSiteUrl()}/dashboard`);

    // Clear temporary VK cookies
    redirect.cookies.set(`${COOKIE_PREFIX}.vk.code_verifier`, "", { maxAge: 0, path: "/" });
    redirect.cookies.set(`${COOKIE_PREFIX}.vk.state`, "", { maxAge: 0, path: "/" });
    redirect.cookies.set(`${COOKIE_PREFIX}.vk.device_id`, "", { maxAge: 0, path: "/" });

    return redirect;
  } catch (err: any) {
    console.error("[VK OAuth] Fatal error:", err.message || err);
    const errorMsg = encodeURIComponent(err.message || "unknown_error");
    return NextResponse.redirect(`${getSiteUrl()}/login?error=${errorMsg}`);
  }
}
