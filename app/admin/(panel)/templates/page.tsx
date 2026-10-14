"use client";
import { useState } from "react";
import { marketplaceCategories } from "@/data/categories";
import { Card, ErrorBox, Skeleton, btn, btnLight, input, send, useApi } from "@/components/admin/ui";
import { Toggle } from "@/components/customize/Controls";

type Row = {
  id: string; defaultName: string; defaultDescription: string; defaultCategory: string;
  name: string; description: string; category: string; hidden: boolean; deleted: boolean; real: boolean;
};

function Editor({ row, onSaved }: { row: Row; onSaved: () => void }) {
  const [f, setF] = useState({ name: row.name, description: row.description, category: row.category, hidden: row.hidden, deleted: row.deleted });
  const [state, setState] = useState("");
  const save = async (patch?: Partial<typeof f>) => {
    const next = { ...f, ...patch };
    setF(next);
    setState("Saving...");
    try { await send("/api/admin/templates", "PUT", { id: row.id, ...next }); setState("Saved. Visitors see it within a minute."); onSaved(); } catch (e) { setState(e instanceof Error ? e.message : "Could not save."); }
  };
  return (
    <Card className={f.deleted ? "opacity-70" : ""}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{row.defaultName} <span className="ml-2 text-xs font-normal text-[#6B6B6B]">{row.id} {row.real ? "(real template)" : "(demo)"}</span></h2>
        {f.deleted && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Deleted</span>}
        {!f.deleted && f.hidden && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Hidden</span>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Name<input className={`${input} mt-1.5`} maxLength={60} value={f.name} placeholder={row.defaultName} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="text-sm font-medium">Category
          <select className={`${input} mt-1.5`} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="">Default ({row.defaultCategory})</option>
            {marketplaceCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">Description<input className={`${input} mt-1.5`} maxLength={200} value={f.description} placeholder={row.defaultDescription} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Toggle label="Hide from visitors" checked={f.hidden} onChange={(v) => setF({ ...f, hidden: v })} />
        <button type="button" className={btn} onClick={() => save()}>Save changes</button>
        {f.deleted ? (
          <button type="button" className={btnLight} onClick={() => save({ deleted: false })}>Restore</button>
        ) : (
          <button type="button" className={`${btnLight} hover:!border-red-500 hover:!text-red-600`} onClick={() => window.confirm(`Delete "${row.defaultName}" from the site? Websites already made with it keep working. You can restore it later.`) && save({ deleted: true })}>Delete</button>
        )}
      </div>
      {state && <p role="status" className="mt-3 text-sm text-[#6B6B6B]">{state}</p>}
    </Card>
  );
}

export default function TemplatesAdmin() {
  const { data, error, loading, reload } = useApi<Row[]>("/api/admin/templates");
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Templates</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Edit names and descriptions, hide a template, or delete it. Deleted or hidden templates disappear from the site and cannot be used for new websites. Websites already made keep working.</p>
      <div className="mt-6 space-y-4">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data?.map((r) => <Editor key={r.id} row={r} onSaved={reload} />)}
      </div>
    </div>
  );
}
