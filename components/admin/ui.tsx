"use client";
import { useCallback, useEffect, useState } from "react";

/** Loads JSON from an admin API and lets the page reload it. */
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Could not load.");
      setData(j as T);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load."); }
    setLoading(false);
  }, [url]);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);
  return { data, error, loading, reload: load };
}

export async function send(url: string, method: "PUT" | "DELETE" | "POST", body?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error ?? "Something went wrong.");
  return j;
}

export const Card = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => (
  <section className={`rounded-2xl border border-[#E7E7EA] bg-white p-5 shadow-sm ${className}`}>
    {title && <h2 className="mb-4 text-sm font-semibold text-[#6B6B6B]">{title}</h2>}
    {children}
  </section>
);

export const Stat = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => (
  <Card>
    <p className="text-sm text-[#6B6B6B]">{label}</p>
    <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    {hint && <p className="mt-1 text-xs text-[#6B6B6B]">{hint}</p>}
  </Card>
);

export const ErrorBox = ({ message }: { message: string }) => (
  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
);

export const Skeleton = () => <div className="h-28 animate-pulse rounded-2xl bg-[#F7F7F8]" />;

export const bytes = (n?: number) => (!n ? "0 MB" : n < 1048576 ? `${Math.round(n / 1024)} KB` : n < 1073741824 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1073741824).toFixed(2)} GB`);
export const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export const btn = "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:pointer-events-none disabled:opacity-40";
export const btnLight = "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D9D9DE] bg-white px-5 text-sm font-semibold transition hover:border-[#111111] disabled:pointer-events-none disabled:opacity-40";
export const input = "h-11 w-full rounded-xl border border-[#E7E7EA] bg-white px-4 text-[15px] outline-none transition focus:border-[#111111]";
