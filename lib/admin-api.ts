import "server-only";
import { NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";

export class HttpError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

/** Every /api/admin/* route goes through here: admin check first, safe errors after. */
export async function adminRoute(req: Request, fn: () => Promise<unknown>) {
  const blocked = await guardApi(req);
  if (blocked) return blocked;
  try {
    return NextResponse.json(await fn(), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("admin api:", e instanceof Error ? e.message : "error");
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Something went wrong. Check that the setup SQL (supabase/admin.sql) was run." }, { status: 500 });
  }
}
