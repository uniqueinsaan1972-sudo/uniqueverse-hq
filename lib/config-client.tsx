"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { templates as baseTemplates } from "@/data/templates";
import type { Template } from "@/types/template";
import type { HomeKey, PublicConfig } from "@/lib/site-config";

const EMPTY: PublicConfig = { home: {}, templates: {} };
const KEY = "uv:config";
let current: PublicConfig = EMPTY;
let restored = false;
const subs = new Set<() => void>();

const subscribe = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb); }; };
function snapshot() {
  if (!restored && typeof window !== "undefined") {
    restored = true;
    try { const raw = localStorage.getItem(KEY); if (raw) current = JSON.parse(raw); } catch { /* ignore */ }
  }
  return current;
}
function setConfig(c: PublicConfig) {
  current = c;
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
const useConfig = () => useSyncExternalStore(subscribe, snapshot, () => EMPTY);

/** Loads admin edits once per visit. Until it answers, the built-in text and templates are shown. */
export function ConfigLoader() {
  useEffect(() => {
    fetch("/api/config").then((r) => (r.ok ? r.json() : null)).then((c) => { if (c) setConfig(c as PublicConfig); }).catch(() => undefined);
  }, []);
  return null;
}

/** Text that the admin can change; `children` is the default. */
export function T({ k, children }: { k: HomeKey; children: string }) {
  const c = useConfig();
  return <>{c.home[k] || children}</>;
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
