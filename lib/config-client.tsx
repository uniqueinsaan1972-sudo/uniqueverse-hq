"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { templates as baseTemplates } from "@/data/templates";
import { marketplaceCategories } from "@/data/categories";
import type { Template } from "@/types/template";
import { PRICING_DEFAULTS, type CategoryRow, type HomeKey, type PublicConfig } from "@/lib/site-config";

const EMPTY: PublicConfig = { home: {}, templates: {}, categories: [], pricing: PRICING_DEFAULTS };
const KEY = "uv:config2";
let current: PublicConfig = EMPTY;
let restored = false;
const subs = new Set<() => void>();

const normalize = (c: Partial<PublicConfig>): PublicConfig => ({
  home: c.home ?? {}, templates: c.templates ?? {}, categories: c.categories ?? [], pricing: { ...PRICING_DEFAULTS, ...(c.pricing ?? {}) },
});
const subscribe = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb); }; };
function snapshot() {
  if (!restored && typeof window !== "undefined") {
    restored = true;
    try { const raw = localStorage.getItem(KEY); if (raw) current = normalize(JSON.parse(raw)); } catch { /* ignore */ }
  }
  return current;
}
function setConfig(c: PublicConfig) {
  current = c;
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
export const useConfig = () => useSyncExternalStore(subscribe, snapshot, () => EMPTY);

/** Loads admin edits once per visit. Until it answers, the built-in text and templates are shown. */
export function ConfigLoader() {
  useEffect(() => {
    fetch("/api/config").then((r) => (r.ok ? r.json() : null)).then((c) => { if (c) setConfig(normalize(c as Partial<PublicConfig>)); }).catch(() => undefined);
  }, []);
  return null;
}

/** Text that the admin can change; `children` is the default. */
export function T({ k, children }: { k: HomeKey; children: string }) {
  const c = useConfig();
  return <>{c.home[k] || children}</>;
}

/** Visible categories in the admin's order. Falls back to the built-in list until the admin edits them. */
export function useCategories(): { id: string; label: string }[] {
  const c = useConfig();
  return useMemo(() => {
    const rows: CategoryRow[] = c.categories;
    if (!rows.length) return marketplaceCategories;
    return rows.filter((r) => !r.hidden).sort((a, b) => a.sort - b.sort).map((r) => ({ id: r.id, label: r.label }));
  }, [c]);
}

export function useCategoryLabel() {
  const c = useConfig();
  const cats = useCategories();
  return (id: string) => c.categories.find((r) => r.id === id)?.label ?? cats.find((x) => x.id === id)?.label ?? marketplaceCategories.find((x) => x.id === id)?.label ?? id;
}

/** Tokens needed for a template (0 = free). */
export function usePrice(templateId: string) {
  const c = useConfig();
  return c.templates[templateId]?.price ?? c.pricing.defaultPrice;
}

/** Built-in templates with admin edits applied, minus hidden and deleted ones. */
export function useTemplates(): Template[] {
  const c = useConfig();
  return useMemo(
    () =>
      baseTemplates
        .filter((t) => !c.templates[t.id]?.hidden && !c.templates[t.id]?.deleted)
        .map((t) => {
          const o = c.templates[t.id];
          return o ? { ...t, name: o.name ?? t.name, description: o.description ?? t.description, category: (o.category ?? t.category) as Template["category"] } : t;
        }),
    [c],
  );
}
