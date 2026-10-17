"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, ErrorBox, Skeleton, btn, btnLight, input, send, useApi } from "@/components/admin/ui";
import { Toggle } from "@/components/customize/Controls";
import type { CategoryRow } from "@/lib/site-config";

function Item({ c, onDone, setMsg }: { c: CategoryRow; onDone: () => void; setMsg: (m: string) => void }) {
  const [label, setLabel] = useState(c.label);
  const [sort, setSort] = useState(String(c.sort));
  const save = async (patch: Record<string, unknown> = {}) => {
    try { await send("/api/admin/categories", "PUT", { id: c.id, label, sort: Number(sort), ...patch }); setMsg("Saved."); onDone(); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not save."); }
  };
  const remove = async () => {
    if (!window.confirm(`Delete the category "${c.label}"?`)) return;
    try { await send(`/api/admin/categories?id=${encodeURIComponent(c.id)}`, "DELETE"); setMsg("Deleted."); onDone(); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not delete."); }
  };
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#F1F1F3] px-4 py-3 last:border-0">
      <input aria-label="Category name" className={`${input} !h-10 !w-48`} maxLength={30} value={label} onChange={(e) => setLabel(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-[#6B6B6B]">Order<input aria-label="Order number" inputMode="numeric" className={`${input} !h-10 !w-20`} value={sort} onChange={(e) => setSort(e.target.value.replace(/\D/g, ""))} /></label>
      <Toggle label="Hidden" checked={c.hidden} onChange={(v) => save({ hidden: v })} />
      <button type="button" onClick={() => save()} className={`${btn} !h-10`}>Save</button>
      <button type="button" aria-label={`Delete ${c.label}`} onClick={remove} className={`${btnLight} !h-10 !px-3 hover:!border-red-500 hover:!text-red-600`}><Trash2 size={15} /></button>
    </div>
  );
}

export default function CategoriesPage() {
  const { data, error, loading, reload } = useApi<CategoryRow[]>("/api/admin/categories");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await send("/api/admin/categories", "POST", { label: name }); setName(""); setMsg("Category added."); reload(); } catch (err) { setMsg(err instanceof Error ? err.message : "Could not add."); }
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">These are the filters visitors see. Put a template in a category from the Templates page. A smaller order number shows first.</p>
      <form onSubmit={add} className="mt-6 flex flex-wrap gap-3">
        <input required aria-label="New category name" placeholder="New category name" maxLength={30} className={`${input} !w-64`} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className={btn}>Add category</button>
        {msg && <span role="status" className="self-center text-sm text-[#6B6B6B]">{msg}</span>}
      </form>
      <div className="mt-6 space-y-4">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && <Card className="!p-0">{data.map((c) => <Item key={`${c.id}-${c.label}-${c.sort}-${c.hidden}`} c={c} onDone={reload} setMsg={setMsg} />)}</Card>}
      </div>
    </div>
  );
}
