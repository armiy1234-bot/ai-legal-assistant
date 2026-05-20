export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    VK_CLIENT_ID: process.env.VK_CLIENT_ID?.slice(0, 8) + "...",
    VK_CLIENT_SECRET: !!process.env.VK_CLIENT_SECRET,
    OAUTH_GOOGLE_CLIENT_ID: process.env.OAUTH_GOOGLE_CLIENT_ID?.slice(0, 10) + "...",
    OAUTH_GOOGLE_CLIENT_SECRET: !!process.env.OAUTH_GOOGLE_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  return Response.json({
    status: "ok",
    ts: new Date().toISOString(),
    env: checks,
  });
}
