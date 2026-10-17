"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, ErrorBox, Skeleton, btn, btnLight, input, send, useApi } from "@/components/admin/ui";
import type { PaymentMethod } from "@/lib/site-config";

type Pricing = { defaultPrice: number; minTopup: number; maxTopup: number; methods: PaymentMethod[] };

function Form({ initial }: { initial: Pricing }) {
  const [f, setF] = useState({ defaultPrice: String(initial.defaultPrice), minTopup: String(initial.minTopup), maxTopup: String(initial.maxTopup) });
  const [methods, setMethods] = useState<PaymentMethod[]>(initial.methods);
  const [msg, setMsg] = useState("");
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value.replace(/\D/g, "") });
  const setM = (i: number, k: keyof PaymentMethod, v: string) => setMethods(methods.map((m, j) => (j === i ? { ...m, [k]: v } : m)));
  const save = async () => {
    setMsg("Saving...");
    try { await send("/api/admin/pricing", "PUT", { defaultPrice: Number(f.defaultPrice), minTopup: Number(f.minTopup), maxTopup: Number(f.maxTopup), methods }); setMsg("Saved. Visitors see it within a minute."); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not save."); }
  };
  return (
    <div className="space-y-5">
      <Card title="Tokens">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-medium">Default price per website (tokens, 0 = free)<input inputMode="numeric" className={`${input} mt-1.5`} value={f.defaultPrice} onChange={num("defaultPrice")} /></label>
          <label className="text-sm font-medium">Smallest top-up<input inputMode="numeric" className={`${input} mt-1.5`} value={f.minTopup} onChange={num("minTopup")} /></label>
          <label className="text-sm font-medium">Biggest top-up<input inputMode="numeric" className={`${input} mt-1.5`} value={f.maxTopup} onChange={num("maxTopup")} /></label>
        </div>
        <p className="mt-3 text-xs text-[#6B6B6B]">1 rupee = 1 token. A single template can have its own price (or be free) on the Templates page.</p>
      </Card>
      <Card title="Where users send money">
        <div className="space-y-4">
          {methods.map((m, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-[#E7E7EA] p-4 sm:grid-cols-2">
              <input aria-label="Method name" placeholder="Method (e.g. Easypaisa)" maxLength={40} className={input} value={m.label} onChange={(e) => setM(i, "label", e.target.value)} />
              <input aria-label="Account title" placeholder="Account holder name" maxLength={60} className={input} value={m.title} onChange={(e) => setM(i, "title", e.target.value)} />
              <input aria-label="Account number" placeholder="Number" maxLength={60} className={input} value={m.number} onChange={(e) => setM(i, "number", e.target.value)} />
              <input aria-label="Note" placeholder="Note for the user (optional)" maxLength={200} className={input} value={m.note} onChange={(e) => setM(i, "note", e.target.value)} />
              <button type="button" onClick={() => setMethods(methods.filter((_, j) => j !== i))} className={`${btnLight} w-fit hover:!border-red-500 hover:!text-red-600`}><Trash2 size={15} /> Remove</button>
            </div>
          ))}
          {methods.length < 10 && <button type="button" onClick={() => setMethods([...methods, { label: "", title: "", number: "", note: "" }])} className={btnLight}><Plus size={16} /> Add a payment method</button>}
        </div>
      </Card>
      <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={save} className={btn}>Save</button>{msg && <span role="status" className="text-sm text-[#6B6B6B]">{msg}</span>}</div>
    </div>
  );
}

export default function PricingPage() {
  const { data, error, loading } = useApi<Pricing>("/api/admin/pricing");
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pricing and payment methods</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Users see the payment methods only after they sign in.</p>
      <div className="mt-6 space-y-4">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && <Form initial={data} />}
      </div>
    </div>
  );
}
