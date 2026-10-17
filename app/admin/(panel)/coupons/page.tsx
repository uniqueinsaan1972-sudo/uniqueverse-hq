"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, ErrorBox, Skeleton, btn, btnLight, input, send, useApi } from "@/components/admin/ui";

type Coupon = { code: string; kind: "percent" | "flat"; value: number; max_uses: number | null; used: number; expires_at: string | null; active: boolean };

export default function CouponsPage() {
  const { data, error, loading, reload } = useApi<Coupon[]>("/api/admin/coupons");
  const [f, setF] = useState({ code: "", kind: "percent", value: "", maxUses: "", expires: "" });
  const [msg, setMsg] = useState("");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try { await send("/api/admin/coupons", "POST", { ...f, value: Number(f.value), maxUses: f.maxUses ? Number(f.maxUses) : null }); setF({ code: "", kind: "percent", value: "", maxUses: "", expires: "" }); setMsg("Coupon created."); reload(); } catch (err) { setMsg(err instanceof Error ? err.message : "Could not create."); }
  };
  const toggle = async (c: Coupon) => { try { await send("/api/admin/coupons", "PUT", { code: c.code, active: !c.active }); reload(); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not save."); } };
  const remove = async (c: Coupon) => { if (window.confirm(`Delete coupon ${c.code}?`)) { try { await send(`/api/admin/coupons?code=${encodeURIComponent(c.code)}`, "DELETE"); reload(); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not delete."); } } };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Coupons</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">A coupon lowers the rupees a user pays for tokens. They still get the full tokens. Each user can use a coupon once.</p>
      <form onSubmit={create} className="mt-6">
        <Card title="New coupon">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-medium">Code<input required className={`${input} mt-1.5 uppercase`} maxLength={30} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} /></label>
            <label className="text-sm font-medium">Type
              <select className={`${input} mt-1.5`} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="percent">Percent off</option><option value="flat">Rupees off</option></select>
            </label>
            <label className="text-sm font-medium">{f.kind === "percent" ? "Percent (1-90)" : "Rupees"}<input required inputMode="numeric" className={`${input} mt-1.5`} value={f.value} onChange={(e) => setF({ ...f, value: e.target.value.replace(/\D/g, "") })} /></label>
            <label className="text-sm font-medium">Max uses (empty = unlimited)<input inputMode="numeric" className={`${input} mt-1.5`} value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value.replace(/\D/g, "") })} /></label>
            <label className="text-sm font-medium">Ends on (optional)<input type="date" className={`${input} mt-1.5`} value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button type="submit" className={btn}>Create coupon</button>{msg && <span role="status" className="text-sm text-[#6B6B6B]">{msg}</span>}</div>
        </Card>
      </form>
      <div className="mt-6 space-y-4">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && (data.length === 0 ? <Card><p className="text-sm text-[#6B6B6B]">No coupons yet.</p></Card> : (
          <Card className="overflow-x-auto !p-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[#E7E7EA] text-xs text-[#6B6B6B]"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Used</th><th className="px-4 py-3">Ends</th><th className="px-4 py-3" /></tr></thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.code} className="border-b border-[#F1F1F3] last:border-0">
                    <td className="px-4 py-3 font-semibold">{c.code}{!c.active && <span className="ml-2 rounded-full bg-[#F1F1F3] px-2 py-0.5 text-xs font-medium text-[#6B6B6B]">off</span>}</td>
                    <td className="px-4 py-3">{c.kind === "percent" ? `${c.value}% off` : `Rs ${c.value} off`}</td>
                    <td className="px-4 py-3">{c.used}{c.max_uses !== null ? ` / ${c.max_uses}` : " (no limit)"}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "never"}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => toggle(c)} className={`${btnLight} !h-9`}>{c.active ? "Turn off" : "Turn on"}</button><button type="button" aria-label={`Delete ${c.code}`} onClick={() => remove(c)} className={`${btnLight} !h-9 !px-3 hover:!border-red-500 hover:!text-red-600`}><Trash2 size={15} /></button></div></td>
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
