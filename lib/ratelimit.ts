import "server-only";
import { adminDb } from "@/lib/supabase";

export function clientIp(req: Request) {
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** true = allowed. If the limiter itself fails we allow the request (the site keeps working). */
export async function allow(key: string, max: number, windowSeconds: number) {
  try {
    const { data, error } = await adminDb().rpc("rate_limit", { p_key: key, p_max: max, p_window: windowSeconds });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}
