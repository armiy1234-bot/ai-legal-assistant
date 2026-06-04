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

  // Redirect VK OAuth callback from AuthJS route to our standalone handler.
  // VK redirects to the registered URI (/api/auth/callback/vk), not the
  // redirect_uri we send. Our standalone handler at /api/auth/vk has the
  // custom PKCE cookie handling and token exchange logic.
  if (url.pathname.startsWith("/api/auth/callback/vk")) {
    const params = url.searchParams.toString();
    const deviceId = url.searchParams.get("device_id");

    console.log("[middleware:VK] Redirecting callback to /api/auth/vk", {
      hasDeviceId: !!deviceId,
      deviceIdPreview: deviceId?.substring(0, 20) + "...",
      hasCode: !!url.searchParams.get("code"),
    });

    // Redirect to our standalone handler preserving all query params
    return NextResponse.redirect(
      new URL(`/api/auth/vk?${params}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/auth/callback/:provider*",
};
