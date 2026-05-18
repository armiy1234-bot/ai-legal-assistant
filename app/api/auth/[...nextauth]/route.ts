import { handlers, setVKDeviceId } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/callback/vk")) {
    const deviceId = url.searchParams.get("device_id");
    if (deviceId) setVKDeviceId(deviceId);
  }
  return handlers.GET(req);
}

export const POST = handlers.POST;
