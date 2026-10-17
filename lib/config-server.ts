import "server-only";
import { adminDb } from "@/lib/supabase";
import type { CategoryRow, HomeKey, PublicConfig, TemplateOverride } from "@/lib/site-config";
import { HOME_KEYS, PRICING_DEFAULTS } from "@/lib/site-config";

const whole = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : fallback;

export async function loadPublicConfig(): Promise<PublicConfig> {
  const db = adminDb();
  const [home, tpl, cats, pricing] = await Promise.all([
    db.from("site_settings").select("value").eq("key", "home").maybeSingle(),
    db.from("template_overrides").select("*"),
    db.from("categories").select("id,label,sort,hidden").order("sort"),
    db.from("site_settings").select("value").eq("key", "pricing").maybeSingle(),
  ]);
  const raw = (home.data?.value ?? {}) as Record<string, unknown>;
  const homeOut: PublicConfig["home"] = {};
  for (const k of HOME_KEYS) if (typeof raw[k] === "string" && raw[k]) homeOut[k as HomeKey] = raw[k] as string;
  const templates: Record<string, TemplateOverride> = {};
  for (const r of tpl.data ?? []) {
    templates[r.template_id] = {
      ...(r.name ? { name: r.name } : {}), ...(r.description ? { description: r.description } : {}),
      ...(r.category ? { category: r.category } : {}), ...(r.hidden ? { hidden: true } : {}), ...(r.deleted ? { deleted: true } : {}),
      ...(typeof r.price === "number" ? { price: r.price } : {}),
    };
  }
  const p = (pricing.data?.value ?? {}) as Record<string, unknown>;
  const minTopup = whole(p.minTopup, PRICING_DEFAULTS.minTopup, 1, 100000);
  return {
    home: homeOut, templates,
    categories: (cats.data ?? []) as CategoryRow[],
    pricing: {
      defaultPrice: whole(p.defaultPrice, PRICING_DEFAULTS.defaultPrice, 0, 100000),
      minTopup,
      maxTopup: Math.max(minTopup, whole(p.maxTopup, PRICING_DEFAULTS.maxTopup, 1, 100000)),
    },
  };
}
