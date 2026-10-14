import "server-only";
import { adminDb } from "@/lib/supabase";
import { HttpError } from "@/lib/admin-api";
import { templates as base } from "@/data/templates";
import { marketplaceCategories } from "@/data/categories";
import { loadPublicConfig } from "@/lib/config-server";
import { HOME_KEYS, HOME_LABELS, type HomeKey } from "@/lib/site-config";

const must = <T,>(r: { data: T; error: { message: string } | null }) => {
  if (r.error) throw new Error(r.error.message);
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
  if (total.error) throw new Error(total.error.message);
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
    };
  });
}

export async function saveTemplate(raw: Record<string, unknown>) {
  const id = String(raw.id ?? "");
  if (!base.some((t) => t.id === id)) throw new HttpError("Unknown template.");
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const category = text(raw.category, 40);
  if (category && !marketplaceCategories.some((c) => c.id === category)) throw new HttpError("Unknown category.");
  const row = {
    template_id: id, name: text(raw.name, 60) || null, description: text(raw.description, 200) || null,
    category: category || null, hidden: raw.hidden === true, deleted: raw.deleted === true, updated_at: new Date().toISOString(),
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
