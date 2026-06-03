import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * VK ID OAuth middleware — captures device_id from callback URL
 * and passes it via request headers for the token exchange step.
 *
 * VK ID code_v2 flow generates a device_id during authorization
 * and expects it back during token exchange. AuthJS v5 doesn't
 * forward non-standard callback params to the token request.
 *
 * We use request headers (not cookies) because cookies set by
 * middleware are on the *response* and not readable by cookies()
 * in the same request lifecycle.
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

    // Pass device_id via request headers (works in same request lifecycle)
    const requestHeaders = new Headers(request.headers);
    if (deviceId) requestHeaders.set("x-vk-device-id", deviceId);
    if (extId) requestHeaders.set("x-vk-ext-id", extId);
    if (state) requestHeaders.set("x-vk-state", state);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/auth/callback/:provider*",
};
