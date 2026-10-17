import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { allow, clientIp } from "@/lib/ratelimit";
import { quote } from "@/lib/tokens";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  if (!(await allow(`quote:${clientIp(req)}`, 60, 60))) return NextResponse.json({ ok: false, error: "Too many tries. Wait a moment." }, { status: 429 });
  const u = new URL(req.url);
  try {
    return NextResponse.json(await quote(user.id, u.searchParams.get("tokens"), u.searchParams.get("coupon")), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not check right now. Please try again." }, { status: 500 });
  }
}
