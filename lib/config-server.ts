import "server-only";
import { adminDb } from "@/lib/supabase";
import type { HomeKey, PublicConfig, TemplateOverride } from "@/lib/site-config";
import { HOME_KEYS } from "@/lib/site-config";

export async function loadPublicConfig(): Promise<PublicConfig> {
  const db = adminDb();
  const [home, tpl] = await Promise.all([
    db.from("site_settings").select("value").eq("key", "home").maybeSingle(),
    db.from("template_overrides").select("template_id,name,description,category,hidden,deleted"),
  ]);
  const raw = (home.data?.value ?? {}) as Record<string, unknown>;
  const homeOut: PublicConfig["home"] = {};
  for (const k of HOME_KEYS) if (typeof raw[k] === "string" && raw[k]) homeOut[k as HomeKey] = raw[k] as string;
  const templates: Record<string, TemplateOverride> = {};
  for (const r of tpl.data ?? []) {
    templates[r.template_id] = {
      ...(r.name ? { name: r.name } : {}), ...(r.description ? { description: r.description } : {}),
      ...(r.category ? { category: r.category } : {}), ...(r.hidden ? { hidden: true } : {}), ...(r.deleted ? { deleted: true } : {}),
    };
  }
  return { home: homeOut, templates };
}
