import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * VK ID OAuth middleware — captures device_id from callback URL
 * and stores it in a cookie for the token exchange step.
 *
 * VK ID code_v2 flow generates a device_id during authorization
 * and expects it back during token exchange. AuthJS v5 doesn't
 * forward non-standard callback params to the token request.
 */
export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // Intercept VK OAuth callback to capture device_id
  if (url.pathname.startsWith("/api/auth/callback/vk")) {
    const deviceId = url.searchParams.get("device_id");
    const extId = url.searchParams.get("ext_id");
    const state = url.searchParams.get("state");
    const codeVer = url.searchParams.get("code_verifier");

    console.log("[middleware:VK] Callback params:", {
      device_id: deviceId,
      ext_id: extId,
      state,
      code_verifier: codeVer,
    });

    const response = NextResponse.next();

    // Store device_id in a cookie for the token exchange step
    if (deviceId) {
      response.cookies.set("__Secure-authjs.vk.device_id", deviceId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 900, // 15 minutes
      });
    }

    if (extId) {
      response.cookies.set("__Secure-authjs.vk.ext_id", extId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 900,
      });
    }

    if (state) {
      response.cookies.set("__Secure-authjs.vk.state", state, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 900,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/auth/callback/:provider*",
};
