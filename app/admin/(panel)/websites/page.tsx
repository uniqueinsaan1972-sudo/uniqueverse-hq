"use client";
import { useState } from "react";
import { ExternalLink, Search, Trash2 } from "lucide-react";
import { Card, ErrorBox, Skeleton, btnLight, input, send, useApi, when } from "@/components/admin/ui";

type Row = { id: string; slug: string; templateId: string; createdAt: string; updatedAt: string; name: string };

export default function WebsitesPage() {
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const { data, error, loading, reload } = useApi<Row[]>(`/api/admin/websites?q=${encodeURIComponent(applied)}`);
  const [msg, setMsg] = useState("");

  const remove = async (r: Row) => {
    if (!window.confirm(`Delete "${r.slug}" and its photos? This cannot be undone and its link will stop working.`)) return;
    try { await send(`/api/admin/websites?id=${r.id}`, "DELETE"); setMsg(`Deleted ${r.slug}.`); reload(); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not delete."); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Websites</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Newest 200. Search by link name.</p>
      <form className="mt-5 flex gap-2" onSubmit={(e) => { e.preventDefault(); setApplied(q); }}>
        <input aria-label="Search by link name" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search link name..." className={input} />
        <button type="submit" className={btnLight}><Search size={16} /> Search</button>
      </form>
      <div className="mt-5 space-y-4">
        {msg && <p role="status" className="rounded-xl bg-[#F1F1F3] px-4 py-3 text-sm">{msg}</p>}
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && (data.length === 0 ? <Card><p className="text-sm text-[#6B6B6B]">No websites found.</p></Card> : (
          <Card className="overflow-x-auto !p-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[#E7E7EA] text-xs text-[#6B6B6B]"><tr><th className="px-4 py-3">Link</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Template</th><th className="px-4 py-3">Created</th><th className="px-4 py-3" /></tr></thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-b border-[#F1F1F3] last:border-0">
                    <td className="px-4 py-3 font-medium">{r.slug}</td>
                    <td className="px-4 py-3">{r.name || "-"}</td>
                    <td className="px-4 py-3">{r.templateId}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{when(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <a href={`/birthday/${r.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${r.slug}`} className={`${btnLight} !h-9 !px-3`}><ExternalLink size={15} /></a>
                        <button type="button" aria-label={`Delete ${r.slug}`} onClick={() => remove(r)} className={`${btnLight} !h-9 !px-3 hover:!border-red-500 hover:!text-red-600`}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
}
