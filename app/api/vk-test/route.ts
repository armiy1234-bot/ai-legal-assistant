export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const deviceId = url.searchParams.get("device_id");
  const extId = url.searchParams.get("ext_id");

  const results: any = {};

  // 1. Test basic connectivity to VK ID endpoints
  results.endpoints = {};
  for (const [name, ep] of Object.entries({
    authorize: "https://id.vk.ru/authorize",
    token: "https://id.vk.ru/oauth2/auth",
    userinfo: "https://id.vk.ru/oauth2/user_info",
  })) {
    try {
      const r = await fetch(ep, { method: "HEAD", redirect: "manual" });
      results.endpoints[name] = { status: r.status, ok: r.ok };
    } catch (e: any) {
      results.endpoints[name] = { error: e.message };
    }
  }

  // 2. Test token exchange if code is provided (will fail without PKCE, but shows VK ID error format)
  if (code) {
    results.token_test = {};

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.VK_CLIENT_ID || "",
      redirect_uri: (process.env.NEXTAUTH_URL || "") + "/api/auth/callback/vk",
      code_verifier: "x",
      device_id: deviceId || "",
      state: extId || "",
    });

    try {
      const tokRes = await fetch("https://id.vk.ru/oauth2/auth", {
        method: "POST",
        redirect: "manual",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      });
      results.token_test.status = tokRes.status;
      results.token_test.body = (await tokRes.text()).slice(0, 500);
    } catch (e: any) {
      results.token_test.error = e.message;
    }
  }

  // 3. Check env vars existence
  results.env = {
    VK_CLIENT_ID: !!process.env.VK_CLIENT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };

  return Response.json(results);
}
