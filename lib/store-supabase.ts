import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes, timingSafeEqual } from "crypto";
import type { TemplateContent } from "@/types/content";
import type { GeneratedWebsite, QrSettings } from "@/types/website";
import { defaultQr } from "@/types/website";
import { RESERVED, slugify } from "@/lib/slug";
import { DATA_URL } from "@/lib/validate";

/**
 * Storage on Supabase: websites live in the `websites` table, uploaded photos in the private `media` bucket.
 * Only the server uses SUPABASE_SECRET_KEY; it is never sent to the browser.
 */
type Row = {
  id: string; template_id: string; slug: string; status: string;
  data: TemplateContent; qr: QrSettings; edit_token: string; previous_slugs: string[] | null; owner_id: string | null;
  created_at: string; updated_at: string;
};

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase is not configured");
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

const toSite = (r: Row): GeneratedWebsite => ({
  id: r.id, templateId: r.template_id, slug: r.slug, status: "published",
  createdAt: r.created_at, updatedAt: r.updated_at, data: r.data, qr: r.qr,
});
const tokenOk = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const EXT: Record<string, string> = { png: "png", jpeg: "jpg", webp: "webp", gif: "gif" };
const BUCKET = "media";

/** Turns uploaded data-URL images into files in the bucket and returns content that only references URLs. */
async function saveImages(id: string, content: TemplateContent): Promise<TemplateContent> {
  const save = async (img: { src: string }) => {
    const m = img.src.match(/^data:image\/(png|jpeg|webp|gif);base64,/);
    if (!m || !DATA_URL.test(img.src)) return img.src;
    const file = `${randomBytes(6).toString("hex")}.${EXT[m[1]]}`;
    const { error } = await db().storage.from(BUCKET).upload(`${id}/${file}`, Buffer.from(img.src.slice(m[0].length), "base64"), { contentType: `image/${m[1]}` });
    if (error) throw new Error("Image upload failed");
    return `/api/media/${id}/${file}`;
  };
  return {
    ...content,
    image: content.image ? { ...content.image, src: await save(content.image) } : null,
    gallery: await Promise.all(content.gallery.map(async (g) => ({ ...g, src: await save(g) }))),
  };
}

async function pickSlug(base: string) {
  let root = slugify(base) || "birthday-surprise";
  if (root.length < 3 || RESERVED.has(root)) root = `${root}-surprise`;
  const { data, error } = await db().from("websites").select("slug").like("slug", `${root}%`);
  if (error) throw error;
  const taken = new Set(((data ?? []) as { slug: string }[]).map((r) => r.slug));
  let slug = root, i = 2;
  while (taken.has(slug) || RESERVED.has(slug)) slug = `${root.slice(0, 55)}-${i++}`;
  return slug;
}

export async function createWebsite(templateId: string, content: TemplateContent, name: string, caption: string, ownerId?: string) {
  const id = randomBytes(8).toString("hex");
  const editToken = randomBytes(24).toString("hex");
  const data = await saveImages(id, content);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = await pickSlug(name);
    const { data: row, error } = await db().from("websites")
      .insert({ id, template_id: templateId, slug, status: "published", data, qr: { ...defaultQr, caption }, edit_token: editToken, previous_slugs: [], owner_id: ownerId ?? null })
      .select("*").single();
    if (!error) return { website: toSite(row as Row), token: editToken };
    if (error.code !== "23505") throw error; // 23505 = someone took the slug a moment ago: pick again
  }
  throw new Error("Could not find a free URL");
}

/** Who is asking: the secret edit key from this browser, and/or the signed-in account that owns the website. */
export type Who = { token?: string; userId?: string };
const allowed = (row: Row, who: Who) =>
  Boolean((who.token && tokenOk(row.edit_token, who.token)) || (who.userId && row.owner_id === who.userId));

type Editable = { slug: string; data: TemplateContent; qr: QrSettings; previousSlugs: string[] };

async function mutate(id: string, who: Who, fn: (s: Editable) => Promise<string | void> | string | void) {
  const { data, error } = await db().from("websites").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  const row = data as Row | null;
  if (!row) return { error: "not_found" as const };
  if (!allowed(row, who)) return { error: "forbidden" as const };
  const s: Editable = { slug: row.slug, data: row.data, qr: row.qr, previousSlugs: row.previous_slugs ?? [] };
  const problem = await fn(s);
  if (problem) return { error: "invalid" as const, message: problem };
  const { data: saved, error: e2 } = await db().from("websites")
    .update({ slug: s.slug, data: s.data, qr: s.qr, previous_slugs: s.previousSlugs, updated_at: new Date().toISOString() })
    .eq("id", id).select("*").single();
  if (e2) {
    if (e2.code === "23505") return { error: "invalid" as const, message: "That URL is already taken." };
    throw e2;
  }
  return { website: toSite(saved as Row) };
}

export const updateContent = (id: string, who: Who, content: TemplateContent) =>
  mutate(id, who, async (s) => { s.data = await saveImages(id, content); });

export const updateMeta = (id: string, who: Who, meta: { slug?: string; qr?: QrSettings }) =>
  mutate(id, who, async (s) => {
    if (meta.slug && meta.slug !== s.slug) {
      if (RESERVED.has(meta.slug)) return "That URL is already taken.";
      const { data } = await db().from("websites").select("id").eq("slug", meta.slug).maybeSingle();
      if (data && (data as { id: string }).id !== id) return "That URL is already taken.";
      s.previousSlugs = [...s.previousSlugs.filter((p) => p !== meta.slug), s.slug];
      s.slug = meta.slug;
    }
    if (meta.qr) s.qr = meta.qr;
  });

export async function getOwned(id: string, who: Who) {
  const { data, error } = await db().from("websites").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  const row = data as Row | null;
  if (!row) return { error: "not_found" as const };
  return allowed(row, who) ? { website: toSite(row) } : { error: "forbidden" as const };
}

export async function getPublicBySlug(slug: string) {
  const { data: hit } = await db().from("websites").select("template_id, slug, data").eq("slug", slug).maybeSingle();
  if (hit) { const h = hit as { template_id: string; slug: string; data: TemplateContent }; return { templateId: h.template_id, slug: h.slug, data: h.data }; }
  const { data: old } = await db().from("websites").select("slug").contains("previous_slugs", [slug]).limit(1).maybeSingle();
  return old ? { redirectTo: (old as { slug: string }).slug } : null;
}

export async function slugAvailable(slug: string, excludeId?: string) {
  const { data, error } = await db().from("websites").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error; // never say "available" when we could not check
  return !data || (data as { id: string }).id === excludeId;
}

export async function readMedia(id: string, file: string) {
  const { data, error } = await db().storage.from(BUCKET).download(`${id}/${file}`);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}
