import "server-only";
import { adminDb } from "@/lib/supabase";
import { PRICING_DEFAULTS, type PaymentMethod } from "@/lib/site-config";
import { loadPublicConfig } from "@/lib/config-server";

export interface Pricing {
  defaultPrice: number;
  minTopup: number;
  maxTopup: number;
  methods: PaymentMethod[];
}

export async function getPricing(): Promise<Pricing> {
  const [cfg, row] = await Promise.all([loadPublicConfig(), adminDb().from("site_settings").select("value").eq("key", "pricing").maybeSingle()]);
  const raw = (row.data?.value ?? {}) as { methods?: unknown };
  const methods = Array.isArray(raw.methods)
    ? (raw.methods as Record<string, unknown>[]).slice(0, 10).map((m) => ({
        label: String(m.label ?? "").slice(0, 40), title: String(m.title ?? "").slice(0, 60),
        number: String(m.number ?? "").slice(0, 60), note: String(m.note ?? "").slice(0, 200),
      })).filter((m) => m.label && m.number)
    : [];
  return { ...cfg.pricing, methods };
}

/** Tokens needed to generate a website with this template (0 = free). */
export async function templatePrice(templateId: string) {
  const [cfg, o] = await Promise.all([loadPublicConfig(), adminDb().from("template_overrides").select("price").eq("template_id", templateId).maybeSingle()]);
  const price = o.data?.price;
  return typeof price === "number" && price >= 0 ? price : cfg.pricing.defaultPrice ?? PRICING_DEFAULTS.defaultPrice;
}

export async function balanceOf(userId: string) {
  const { data } = await adminDb().from("wallets").select("balance").eq("user_id", userId).maybeSingle();
  return (data?.balance as number | undefined) ?? 0;
}

/** true = tokens were taken. false = not enough tokens. Atomic in the database. */
export async function spend(userId: string, amount: number, reason: string, ref: string) {
  const { data, error } = await adminDb().rpc("spend_tokens", { p_user: userId, p_amount: amount, p_reason: reason, p_ref: ref });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function grant(userId: string, amount: number, reason: string, ref: string) {
  const { data, error } = await adminDb().rpc("grant_tokens", { p_user: userId, p_amount: amount, p_reason: reason, p_ref: ref });
  if (error) throw new Error(error.message);
  return data as number;
}

export type Quote =
  | { ok: true; tokens: number; discount: number; payable: number; coupon: string | null }
  | { ok: false; error: string };

/** What the user has to pay for N tokens, with an optional coupon. Does not use up the coupon. */
export async function quote(userId: string, tokensRaw: unknown, couponRaw: unknown): Promise<Quote> {
  const pricing = await getPricing();
  const tokens = Number(tokensRaw);
  if (!Number.isInteger(tokens) || tokens < pricing.minTopup || tokens > pricing.maxTopup) {
    return { ok: false, error: `Choose between ${pricing.minTopup} and ${pricing.maxTopup} tokens.` };
  }
  const code = typeof couponRaw === "string" ? couponRaw.trim().toUpperCase() : "";
  if (!code) return { ok: true, tokens, discount: 0, payable: tokens, coupon: null };
  if (!/^[A-Z0-9_-]{2,30}$/.test(code)) return { ok: false, error: "This coupon code is not valid." };
  const db = adminDb();
  const { data: c } = await db.from("coupons").select("*").eq("code", code).maybeSingle();
  if (!c || !c.active || (c.expires_at && new Date(c.expires_at) < new Date()) || (c.max_uses !== null && c.used >= c.max_uses)) {
    return { ok: false, error: "This coupon is not valid or has run out." };
  }
  const { count } = await db.from("topups").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("coupon", code).in("status", ["pending", "approved"]);
  if (count) return { ok: false, error: "You have already used this coupon." };
  const raw = c.kind === "percent" ? Math.floor((tokens * c.value) / 100) : c.value;
  const discount = Math.min(raw, tokens - 1);
  return { ok: true, tokens, discount, payable: tokens - discount, coupon: code };
}
