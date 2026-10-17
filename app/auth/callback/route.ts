import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth";

/** Email links (password reset) land here, get exchanged for a session, then go to /admin/... */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  const allowedAreas = ["/admin", "/account", "/reset", "/topup", "/customize", "/templates"];
  const safe = next.startsWith("/") && !next.startsWith("//") && allowedAreas.some((p) => next === p || next.startsWith(`${p}/`) || next.startsWith(`${p}?`)) ? next : "/account";
  if (code) {
    try {
      const sb = await authClient();
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(safe, url.origin));
    } catch { /* fall through */ }
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
