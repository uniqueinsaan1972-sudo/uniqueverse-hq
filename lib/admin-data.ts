import "server-only";
import { adminDb } from "@/lib/supabase";
import { HttpError } from "@/lib/admin-api";
import { templates as base } from "@/data/templates";
import { marketplaceCategories } from "@/data/categories";
import { loadPublicConfig } from "@/lib/config-server";
import { slugify } from "@/lib/slug";
import { grant } from "@/lib/tokens";
import type { CategoryRow, PaymentMethod } from "@/lib/site-config";
import { HOME_KEYS, HOME_LABELS, type HomeKey } from "@/lib/site-config";

/** Throws the database error with its code kept, so the admin sees the real reason. */
const must = <T,>(r: { data: T; error: { message: string; code?: string } | null }) => {
  if (r.error) throw Object.assign(new Error(r.error.message), { code: r.error.code });
  return r.data;
};

export async function overview() {
  const db = adminDb();
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [total, week, rows, recent, usage] = await Promise.all([
    db.from("websites").select("id", { count: "exact", head: true }),
    db.from("websites").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("websites").select("template_id").limit(5000),
    db.from("websites").select("id,slug,template_id,created_at").order("created_at", { ascending: false }).limit(5),
    db.rpc("usage_summary"),
  ]);
  if (total.error) throw Object.assign(new Error(total.error.message), { code: total.error.code });
  const byTemplate: Record<string, number> = {};
  for (const r of rows.data ?? []) byTemplate[r.template_id] = (byTemplate[r.template_id] ?? 0) + 1;
  return {
    total: total.count ?? 0, week: week.count ?? 0, byTemplate,
    recent: (recent.data ?? []).map((r) => ({ id: r.id, slug: r.slug, templateId: r.template_id, createdAt: r.created_at })),
    usage: usage.error ? null : usage.data,
    templatesPublished: base.length,
  };
}

export async function listWebsites(q: string) {
  const clean = q.replace(/[^a-z0-9-]/gi, "").slice(0, 60);
  let query = adminDb().from("websites").select("id,slug,template_id,created_at,updated_at,data").order("created_at", { ascending: false }).limit(200);
  if (clean) query = query.ilike("slug", `%${clean}%`);
  const rows = must(await query) ?? [];
  return rows.map((r) => ({
    id: r.id, slug: r.slug, templateId: r.template_id, createdAt: r.created_at, updatedAt: r.updated_at,
    name: (r.data as { names?: { main?: string } } | null)?.names?.main ?? "",
  }));
}

export async function deleteWebsite(id: string) {
  if (!/^[a-f0-9]{16}$/.test(id)) throw new HttpError("Invalid website id.");
  const db = adminDb();
  const files = await db.storage.from("media").list(id);
  if (files.data?.length) await db.storage.from("media").remove(files.data.map((f) => `${id}/${f.name}`));
  must(await db.from("websites").delete().eq("id", id));
  return { ok: true };
}

export async function listTemplates() {
  const cfg = await loadPublicConfig();
  return base.map((t) => {
    const o = cfg.templates[t.id] ?? {};
    return {
      id: t.id, defaultName: t.name, defaultDescription: t.description, defaultCategory: t.category,
      name: o.name ?? "", description: o.description ?? "", category: o.category ?? "",
      hidden: Boolean(o.hidden), deleted: Boolean(o.deleted), real: Boolean(t.previewUrl),
      price: typeof o.price === "number" ? o.price : null, defaultPrice: cfg.pricing.defaultPrice,
    };
  });
}

export async function saveTemplate(raw: Record<string, unknown>) {
  const id = String(raw.id ?? "");
  if (!base.some((t) => t.id === id)) throw new HttpError("Unknown template.");
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const category = text(raw.category, 40);
  if (category && !(await ensureCategories()).some((c) => c.id === category)) throw new HttpError("Unknown category.");
  let price: number | null = null;
  if (raw.price !== null && raw.price !== undefined && raw.price !== "") {
    price = Number(raw.price);
    if (!Number.isInteger(price) || price < 0 || price > 100000) throw new HttpError("Price must be a whole number of tokens (0 = free).");
  }
  const row = {
    template_id: id, name: text(raw.name, 60) || null, description: text(raw.description, 200) || null,
    category: category || null, hidden: raw.hidden === true, deleted: raw.deleted === true, price, updated_at: new Date().toISOString(),
  };
  must(await adminDb().from("template_overrides").upsert(row, { onConflict: "template_id" }));
  return { ok: true };
}

export async function getHome() {
  const cfg = await loadPublicConfig();
  return { values: cfg.home };
}

export async function saveHome(raw: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const k of HOME_KEYS) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) {
      if (v.length > HOME_LABELS[k as HomeKey].max) throw new HttpError(`${HOME_LABELS[k as HomeKey].label} is too long.`);
      out[k] = v.trim();
    }
  }
  must(await adminDb().from("site_settings").upsert({ key: "home", value: out, updated_at: new Date().toISOString() }, { onConflict: "key" }));
  return { ok: true };
}

export async function analytics(days: number) {
  const d = [7, 30, 90].includes(days) ? days : 7;
  return must(await adminDb().rpc("analytics_summary", { p_days: d }));
}

/* ---------- categories ---------- */
export async function ensureCategories(): Promise<CategoryRow[]> {
  const db = adminDb();
  let rows = must(await db.from("categories").select("id,label,sort,hidden").order("sort")) as CategoryRow[];
  if (!rows.length) {
    must(await db.from("categories").insert(marketplaceCategories.map((c, i) => ({ id: c.id, label: c.label, sort: (i + 1) * 10, hidden: false }))));
    rows = must(await db.from("categories").select("id,label,sort,hidden").order("sort")) as CategoryRow[];
  }
  return rows;
}

export const listCategories = () => ensureCategories();

export async function createCategory(raw: Record<string, unknown>) {
  const label = typeof raw.label === "string" ? raw.label.trim().slice(0, 30) : "";
  if (label.length < 2) throw new HttpError("Enter a category name (2+ letters).");
  const rows = await ensureCategories();
  if (rows.length >= 30) throw new HttpError("That is the maximum number of categories.");
  let id = slugify(label).slice(0, 30) || "category";
  const taken = new Set(rows.map((r) => r.id));
  for (let i = 2; taken.has(id); i++) id = `${id.slice(0, 26)}-${i}`;
  must(await adminDb().from("categories").insert({ id, label, sort: Math.max(0, ...rows.map((r) => r.sort)) + 10, hidden: false }));
  return { ok: true };
}

export async function updateCategory(raw: Record<string, unknown>) {
  const id = String(raw.id ?? "");
  const rows = await ensureCategories();
  if (!rows.some((r) => r.id === id)) throw new HttpError("Unknown category.");
  const patch: Record<string, unknown> = {};
  if (typeof raw.label === "string") { const l = raw.label.trim().slice(0, 30); if (l.length < 2) throw new HttpError("Enter a category name (2+ letters)."); patch.label = l; }
  if (typeof raw.sort === "number" && Number.isInteger(raw.sort) && raw.sort >= 0 && raw.sort <= 10000) patch.sort = raw.sort;
  if (typeof raw.hidden === "boolean") patch.hidden = raw.hidden;
  must(await adminDb().from("categories").update(patch).eq("id", id));
  return { ok: true };
}

export async function deleteCategory(id: string) {
  const cfg = await loadPublicConfig();
  const used = base.filter((t) => !cfg.templates[t.id]?.deleted && (cfg.templates[t.id]?.category ?? t.category) === id);
  if (used.length) throw new HttpError(`${used.length} template(s) still use this category. Move them to another category first.`, 409);
  must(await adminDb().from("categories").delete().eq("id", id));
  return { ok: true };
}

/* ---------- pricing and payment methods ---------- */
export async function getPricingAdmin() {
  const cfg = await loadPublicConfig();
  const row = await adminDb().from("site_settings").select("value").eq("key", "pricing").maybeSingle();
  const methods = ((row.data?.value as { methods?: PaymentMethod[] } | null)?.methods ?? []);
  return { ...cfg.pricing, methods };
}

export async function savePricing(raw: Record<string, unknown>) {
  const int = (v: unknown, min: number, max: number, label: string) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) throw new HttpError(`${label} must be a whole number between ${min} and ${max}.`);
    return n;
  };
  const defaultPrice = int(raw.defaultPrice, 0, 100000, "Default price");
  const minTopup = int(raw.minTopup, 1, 100000, "Minimum top-up");
  const maxTopup = int(raw.maxTopup, 1, 100000, "Maximum top-up");
  if (maxTopup < minTopup) throw new HttpError("Maximum top-up must not be smaller than the minimum.");
  const list = Array.isArray(raw.methods) ? (raw.methods as Record<string, unknown>[]).slice(0, 10) : [];
  const t = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const methods = list.map((m) => ({ label: t(m.label, 40), title: t(m.title, 60), number: t(m.number, 60), note: t(m.note, 200) })).filter((m) => m.label && m.number);
  must(await adminDb().from("site_settings").upsert({ key: "pricing", value: { defaultPrice, minTopup, maxTopup, methods }, updated_at: new Date().toISOString() }, { onConflict: "key" }));
  return { ok: true };
}

/* ---------- coupons ---------- */
export async function listCoupons() {
  return must(await adminDb().from("coupons").select("*").order("created_at", { ascending: false }).limit(200)) ?? [];
}

export async function createCoupon(raw: Record<string, unknown>) {
  const code = String(raw.code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,30}$/.test(code)) throw new HttpError("Code: 2 to 30 letters, numbers, - or _.");
  const kind = raw.kind === "flat" ? "flat" : "percent";
  const value = Number(raw.value);
  if (!Number.isInteger(value) || value < 1 || (kind === "percent" ? value > 90 : value > 100000)) throw new HttpError(kind === "percent" ? "Percent must be between 1 and 90." : "Rupees must be between 1 and 100000.");
  let maxUses: number | null = null;
  if (raw.maxUses !== null && raw.maxUses !== undefined && raw.maxUses !== "") {
    maxUses = Number(raw.maxUses);
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 1_000_000) throw new HttpError("Maximum uses must be 1 or more.");
  }
  let expires: string | null = null;
  if (typeof raw.expires === "string" && raw.expires) {
    const d = new Date(`${raw.expires}T23:59:59Z`);
    if (Number.isNaN(d.getTime())) throw new HttpError("The expiry date is not valid.");
    expires = d.toISOString();
  }
  const r = await adminDb().from("coupons").insert({ code, kind, value, max_uses: maxUses, expires_at: expires });
  if (r.error) throw new HttpError(r.error.code === "23505" ? "This code already exists." : r.error.message, 409);
  return { ok: true };
}

export async function setCouponActive(code: string, active: boolean) {
  must(await adminDb().from("coupons").update({ active }).eq("code", code.toUpperCase()));
  return { ok: true };
}

export async function deleteCoupon(code: string) {
  must(await adminDb().from("coupons").delete().eq("code", code.toUpperCase()));
  return { ok: true };
}

/* ---------- top-up requests ---------- */
export async function listTopups(status: string) {
  const db = adminDb();
  let q = db.from("topups").select("*").order("created_at", { ascending: false }).limit(200);
  if (["pending", "approved", "declined"].includes(status)) q = q.eq("status", status);
  const rows = must(await q) ?? [];
  const ids = [...new Set(rows.map((r) => r.user_id as string))];
  const wallets = ids.length ? must(await db.from("wallets").select("user_id,balance").in("user_id", ids)) ?? [] : [];
  const bal = new Map(wallets.map((w) => [w.user_id as string, w.balance as number]));
  return rows.map((r) => ({
    id: r.id, userId: r.user_id, email: r.email, tokens: r.tokens, payable: r.payable, sentAmount: r.sent_amount, coupon: r.coupon,
    txnId: r.txn_id, status: r.status, note: r.note, createdAt: r.created_at, balance: bal.get(r.user_id) ?? 0,
  }));
}

export async function reviewTopup(raw: Record<string, unknown>) {
  const id = String(raw.id ?? "");
  const action = raw.action === "approve" ? "approve" : raw.action === "decline" ? "decline" : "";
  if (!/^[a-f0-9]{16}$/.test(id) || !action) throw new HttpError("Invalid request.");
  const note = typeof raw.note === "string" ? raw.note.trim().slice(0, 200) : null;
  const db = adminDb();
  const { data: row, error } = await db.from("topups")
    .update({ status: action === "approve" ? "approved" : "declined", note: note || null, reviewed_at: new Date().toISOString() })
    .eq("id", id).eq("status", "pending").select("*").maybeSingle(); // only one reviewer wins: no double credit
  if (error) throw Object.assign(new Error(error.message), { code: error.code });
  if (!row) throw new HttpError("This request was already checked, or it does not exist.", 409);
  if (action === "approve") {
    try { await grant(row.user_id, row.tokens, "topup", row.id); } catch (e) {
      await db.from("topups").update({ status: "pending", reviewed_at: null }).eq("id", id);
      throw e;
    }
  } else if (row.coupon) {
    await db.rpc("release_coupon", { p_code: row.coupon });
  }
  return { ok: true };
}

/* ---------- users ---------- */
export async function listUsers() {
  const db = adminDb();
  const res = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (res.error) throw Object.assign(new Error(res.error.message), { code: res.error.code });
  const ids = res.data.users.map((u) => u.id);
  const wallets = ids.length ? must(await db.from("wallets").select("user_id,balance").in("user_id", ids)) ?? [] : [];
  const bal = new Map(wallets.map((w) => [w.user_id as string, w.balance as number]));
  return res.data.users.map((u) => ({
    id: u.id, email: u.email ?? "", name: (u.user_metadata?.full_name as string | undefined) ?? "",
    createdAt: u.created_at, lastSignIn: u.last_sign_in_at ?? null, balance: bal.get(u.id) ?? 0,
  }));
}

export async function adjustTokens(raw: Record<string, unknown>) {
  const userId = String(raw.userId ?? "");
  const amount = Number(raw.amount);
  if (!/^[0-9a-f-]{36}$/.test(userId)) throw new HttpError("Invalid user.");
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 100000) throw new HttpError("Enter a whole number of tokens (use - to remove).");
  try { return { balance: await grant(userId, amount, "admin adjust", String(raw.reason ?? "").slice(0, 80)) }; } catch (e) {
    throw new HttpError(e instanceof Error && e.message.includes("not enough") ? "The user does not have that many tokens." : "Could not change the tokens.", 409);
  }
}
