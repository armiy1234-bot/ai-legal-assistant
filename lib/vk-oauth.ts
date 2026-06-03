import crypto from "crypto";

/**
 * VK ID OAuth utilities — standalone PKCE, token exchange, and userinfo.
 * Used by /api/auth/vk/route.ts to handle VK OAuth outside AuthJS.
 */

const VK_AUTHORIZE_URL = "https://id.vk.com/authorize";
const VK_TOKEN_URL = "https://id.vk.com/oauth2/auth";
const VK_USERINFO_URL = "https://id.vk.com/oauth2/user_info";

function base64URL(buf: Buffer): string {
  return buf.toString("base64url").replace(/=+$/, "");
}

function sha256(input: string): Buffer {
  return crypto.createHash("sha256").update(input).digest();
}

/** Generate PKCE code_verifier and code_challenge */
export function generatePKCE() {
  const verifier = base64URL(crypto.randomBytes(32));
  const challenge = base64URL(sha256(verifier));
  return { verifier, challenge };
}

/** Generate a random state parameter */
export function generateState(): string {
  return base64URL(crypto.randomBytes(32));
}

/** Generate a random device_id for VK ID */
export function generateDeviceId(): string {
  return base64URL(crypto.randomBytes(32));
}

/** Build the VK ID authorization URL */
export function buildAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  deviceId: string;
}) {
  const url = new URL(VK_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", "email phone");
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("device_id", params.deviceId);
  return url.toString();
}

interface VKTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  user_id?: number;
  error?: string;
  error_description?: string;
}

/** Exchange authorization code for tokens */
export async function exchangeCode(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
  deviceId: string;
  state: string;
}): Promise<VKTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: params.clientId,
    client_secret: params.clientSecret,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
    device_id: params.deviceId,
    state: params.state,
  });

  const res = await fetch(VK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const raw = await res.text();
  console.log("[VK OAuth] Token exchange — device_id:", params.deviceId.substring(0, 20) + "...");
  console.log("[VK OAuth] Token exchange — HTTP:", res.status, "raw:", raw.substring(0, 400));

  if (!res.ok) {
    throw new Error(`VK token request failed: HTTP ${res.status} — ${raw}`);
  }

  const json = JSON.parse(raw);
  if (json.error) {
    console.error("[VK OAuth] VK error:", json);
    throw new Error(`VK: ${json.error} — ${json.error_description}`);
  }

  return json;
}

interface VKUserInfo {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

/** Fetch user info with access token */
export async function getUserInfo(
  accessToken: string,
  clientId: string,
): Promise<VKUserInfo> {
  const body = new URLSearchParams({
    client_id: clientId,
    access_token: accessToken,
  });

  const res = await fetch(VK_USERINFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const raw = await res.text();
  console.log("[VK OAuth] Userinfo — HTTP:", res.status, "raw:", raw.substring(0, 400));

  if (!res.ok) {
    throw new Error(`VK userinfo request failed: HTTP ${res.status}`);
  }

  const json = JSON.parse(raw);
  if (json.error) {
    throw new Error(`VK userinfo: ${json.error} — ${json.error_description}`);
  }

  return json.user ?? json;
}
