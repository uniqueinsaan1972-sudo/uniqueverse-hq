"use client";
import { useState } from "react";
import { HOME_DEFAULTS, HOME_KEYS, HOME_LABELS, type HomeKey } from "@/lib/site-config";
import { Card, ErrorBox, Skeleton, btn, btnLight, input, send, useApi } from "@/components/admin/ui";

function Form({ initial }: { initial: Partial<Record<HomeKey, string>> }) {
  const [v, setV] = useState<Record<HomeKey, string>>(() => Object.fromEntries(HOME_KEYS.map((k) => [k, initial[k] ?? HOME_DEFAULTS[k]])) as Record<HomeKey, string>);
  const [state, setState] = useState("");
  const save = async () => {
    setState("Saving...");
    try { await send("/api/admin/home", "PUT", v); setState("Saved. Visitors see it within a minute."); } catch (e) { setState(e instanceof Error ? e.message : "Could not save."); }
  };
  return (
    <Card>
      <div className="space-y-4">
        {HOME_KEYS.map((k) => {
          const meta = HOME_LABELS[k];
          return (
            <div key={k}>
              <div className="flex items-center justify-between">
                <label htmlFor={k} className="text-sm font-medium">{meta.label}</label>
                <button type="button" className="text-xs font-medium text-[#6B6B6B] underline" onClick={() => setV({ ...v, [k]: HOME_DEFAULTS[k] })}>Use original</button>
              </div>
              {meta.long
                ? <textarea id={k} rows={3} maxLength={meta.max} className={`${input} mt-1.5 !h-auto py-3`} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
                : <input id={k} maxLength={meta.max} className={`${input} mt-1.5`} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
              <p className="mt-1 text-right text-xs text-[#6B6B6B]">{v[k].length}/{meta.max}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className={btn} onClick={save}>Save home page</button>
        <button type="button" className={btnLight} onClick={() => setV({ ...HOME_DEFAULTS })}>Reset all to original</button>
        {state && <span role="status" className="text-sm text-[#6B6B6B]">{state}</span>}
      </div>
    </Card>
  );
}

export default function HomepageAdmin() {
  const { data, error, loading } = useApi<{ values: Partial<Record<HomeKey, string>> }>("/api/admin/home");
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Home page</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Change the main texts on the home page. The design stays the same.</p>
      <div className="mt-6 space-y-4">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && <Form initial={data.values} />}
      </div>
    </div>
  );
}
