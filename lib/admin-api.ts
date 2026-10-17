import "server-only";
import { NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";

export class HttpError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

/** Turns a database/network error into a clear sentence for the admin. Never includes keys or row data. */
export function describeError(e: unknown): { message: string; code?: string } {
  const err = (e ?? {}) as { code?: unknown; message?: unknown };
  const code = typeof err.code === "string" ? err.code : undefined;
  const msg = typeof err.message === "string" ? err.message : "";
  if (code === "42703" || code === "PGRST204" || /column .* does not exist/i.test(msg)) {
    return { code, message: `A database column is missing (${msg.slice(0, 140)}). Run supabase/all-in-one.sql in the Supabase SQL Editor.` };
  }
  if (code === "42P01" || code === "PGRST205" || /does not exist|schema cache/i.test(msg)) {
    return { code, message: `A database table is missing (${msg.slice(0, 140)}). In Supabase open SQL Editor and run supabase/all-in-one.sql, then reload this page.` };
  }
  if (code === "PGRST202" || code === "42883") {
    return { code, message: `A database function is missing (${msg.slice(0, 140)}). Run supabase/all-in-one.sql in the Supabase SQL Editor.` };
  }
  if (code === "42501" || /permission denied/i.test(msg)) {
    return { code, message: "The database refused access (permission denied). Check that SUPABASE_SECRET_KEY is the SECRET key (not the publishable key) and that supabase/all-in-one.sql was run, because it contains the GRANT lines." };
  }
  if (/invalid api key|jwt|apikey/i.test(msg)) {
    return { code, message: "Supabase rejected the server key. Check SUPABASE_URL and SUPABASE_SECRET_KEY belong to the same project." };
  }
  if (/fetch failed|econnrefused|enotfound|network/i.test(msg)) {
    return { code, message: "The server could not reach Supabase. Check SUPABASE_URL." };
  }
  return { code, message: "Something went wrong on the server. Open the Overview page and read the Setup check, or look at the server log." };
}

/** Every /api/admin/* route goes through here: admin check first, safe and useful errors after. */
export async function adminRoute(req: Request, fn: () => Promise<unknown>) {
  const blocked = await guardApi(req);
  if (blocked) return blocked;
  try {
    return NextResponse.json(await fn(), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    const d = describeError(e);
    const raw = e as { message?: unknown };
    console.error(`admin api ${new URL(req.url).pathname} failed [${d.code ?? "no-code"}]:`, typeof raw?.message === "string" ? raw.message.slice(0, 300) : "unknown error");
    return NextResponse.json({ error: d.message, code: d.code }, { status: 500 });
  }
}
