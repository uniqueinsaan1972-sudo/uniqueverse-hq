import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, connection } from "next/server";

/** Supabase client that reads/writes the logged-in session cookie. */
export async function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase auth is not configured");
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a page: cookies are read-only there */ }
      },
    },
  });
}

export type AdminState = { ok: true; email: string } | { ok: false; reason: "login" | "forbidden" | "mfa" | "config" };

/** The ONLY place that decides who is an admin. Always runs on the server. */
export async function getAdmin(): Promise<AdminState> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return { ok: false, reason: "config" };
  await connection();
  try {
    const sb = await authClient();
    const { data: { user } } = await sb.auth.getUser(); // verified with Supabase, not just read from the cookie
    if (!user) return { ok: false, reason: "login" };
    if (user.email?.toLowerCase() !== adminEmail || !user.email_confirmed_at) return { ok: false, reason: "forbidden" };
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") return { ok: false, reason: "mfa" };
    return { ok: true, email: user.email };
  } catch {
    return { ok: false, reason: "config" };
  }
}

/** For /api/admin/* routes. Returns an error response, or null when the caller is the admin. */
export async function guardApi(req: Request): Promise<NextResponse | null> {
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (!origin || new URL(origin).host !== req.headers.get("host")) {
      return NextResponse.json({ error: "Request blocked." }, { status: 403 });
    }
  }
  const a = await getAdmin();
  if (a.ok) return null;
  return NextResponse.json({ error: a.reason === "login" ? "Please sign in." : "Not allowed." }, { status: a.reason === "login" ? 401 : 403 });
}
