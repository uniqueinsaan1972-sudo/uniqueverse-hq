import "server-only";
import { adminDb } from "@/lib/supabase";

export interface HealthItem { name: string; ok: boolean; detail?: string }

const TABLES = ["websites", "events", "template_overrides", "site_settings", "rate_limits", "wallets", "token_ledger", "categories", "coupons", "topups"];

const hostOf = (u?: string) => { try { return new URL(u ?? "").host; } catch { return ""; } };
function keyKind(key?: string) {
  if (!key) return "missing";
  if (key.startsWith("sb_publishable_")) return "publishable";
  if (key.startsWith("sb_secret_")) return "secret";
  try {
    const role = JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64url").toString()).role;
    return role === "service_role" ? "secret" : role === "anon" ? "publishable" : "unknown";
  } catch { return "unknown"; }
}

/** Checks everything the money and account features need. Never prints a key. */
export async function runHealth(): Promise<{ ok: boolean; items: HealthItem[] }> {
  const items: HealthItem[] = [];
  const add = (name: string, ok: boolean, detail?: string) => items.push({ name, ok, ...(ok ? {} : { detail }) });

  add("ADMIN_EMAIL is set", Boolean(process.env.ADMIN_EMAIL), "Add ADMIN_EMAIL to .env.local and to the Cloudflare secrets.");
  const kind = keyKind(process.env.SUPABASE_SECRET_KEY);
  add("SUPABASE_SECRET_KEY is the secret key", kind === "secret" || kind === "unknown",
    kind === "missing" ? "SUPABASE_SECRET_KEY is not set." : "This looks like the PUBLISHABLE key. Use the SECRET key from Project Settings > API Keys.");
  const a = hostOf(process.env.SUPABASE_URL), b = hostOf(process.env.NEXT_PUBLIC_SUPABASE_URL);
  add("Server and browser use the same Supabase project", Boolean(a) && a === b, `SUPABASE_URL (${a || "empty"}) and NEXT_PUBLIC_SUPABASE_URL (${b || "empty"}) must be the same project.`);
  add("Browser key is the publishable key", keyKind(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) !== "secret", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must NOT be the secret key. Replace it now and rotate the secret key.");

  let db;
  try { db = adminDb(); } catch { add("Server can create a database connection", false, "SUPABASE_URL or SUPABASE_SECRET_KEY is missing."); return { ok: false, items }; }

  for (const t of TABLES) {
    const r = await db.from(t).select("*").limit(1); // a real read: a HEAD request hides "table missing" errors
    add(`Table ${t}`, !r.error, r.error ? `${r.error.code ?? ""} ${r.error.message}`.trim().slice(0, 160) : undefined);
  }
  for (const [t, c] of [["websites", "owner_id"], ["template_overrides", "price"]] as const) {
    const r = await db.from(t).select(c).limit(1);
    add(`Column ${t}.${c}`, !r.error, r.error ? `${r.error.code ?? ""} ${r.error.message}`.trim().slice(0, 160) : undefined);
  }
  const fn = async (name: string, args: Record<string, unknown>, okIfMessage?: RegExp) => {
    const r = await db.rpc(name, args);
    const present = !r.error || Boolean(okIfMessage && okIfMessage.test(r.error.message));
    add(`Function ${name}`, present, r.error ? `${r.error.code ?? ""} ${r.error.message}`.trim().slice(0, 160) : undefined);
  };
  await fn("usage_summary", {});
  await fn("analytics_summary", { p_days: 1 });
  await fn("redeem_coupon", { p_code: "__HEALTH__" });
  await fn("release_coupon", { p_code: "__HEALTH__" });
  await fn("spend_tokens", { p_user: "00000000-0000-0000-0000-000000000000", p_amount: 0, p_reason: "health", p_ref: "health" });
  await fn("grant_tokens", { p_user: "00000000-0000-0000-0000-000000000000", p_amount: 0, p_reason: "health", p_ref: "health" }, /must not be zero/);
  const bucket = await db.storage.getBucket("media");
  add("Storage bucket media", !bucket.error, "Run supabase/all-in-one.sql: it creates the private bucket named media.");
  return { ok: items.every((i) => i.ok), items };
}
