"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Card, ErrorBox, Skeleton, btn, btnLight, input, send, useApi, when } from "@/components/admin/ui";

type Row = {
  id: string; userId: string; email: string; tokens: number; payable: number; sentAmount: number; coupon: string | null;
  txnId: string | null; status: string; note: string | null; createdAt: string; balance: number;
};

function Item({ r, onDone }: { r: Row; onDone: () => void }) {
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const act = async (action: "approve" | "decline") => {
    const ask = action === "approve"
      ? `Add ${r.tokens} tokens to ${r.email}? Please make sure the money really arrived in your account.`
      : `Decline this request from ${r.email}?`;
    if (!window.confirm(ask)) return;
    setBusy(true); setMsg("");
    try { await send("/api/admin/topups", "PUT", { id: r.id, action, note }); onDone(); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not save."); }
    setBusy(false);
  };
  const mismatch = r.sentAmount !== r.payable;
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{r.email}</p>
          <p className="text-xs text-[#6B6B6B]">Account ID {r.userId} - {when(r.createdAt)}</p>
          <p className="mt-1 text-sm">Tokens now in this account: <b>{r.balance}</b></p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${r.status === "pending" ? "bg-amber-50 text-amber-800" : r.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{r.status}</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:max-w-md">
          <dt className="text-[#6B6B6B]">Tokens asked</dt><dd className="font-semibold">{r.tokens}</dd>
          <dt className="text-[#6B6B6B]">Coupon</dt><dd>{r.coupon ?? "none"}</dd>
          <dt className="text-[#6B6B6B]">Should pay</dt><dd className="font-semibold">Rs {r.payable}</dd>
          <dt className="text-[#6B6B6B]">User says sent</dt><dd className={`font-semibold ${mismatch ? "text-red-600" : "text-emerald-700"}`}>Rs {r.sentAmount}{mismatch && " (different!)"}</dd>
          <dt className="text-[#6B6B6B]">Transaction ID</dt><dd className="break-all">{r.txnId ?? "not given"}</dd>
          {r.note && (<><dt className="text-[#6B6B6B]">Your note</dt><dd>{r.note}</dd></>)}
        </dl>
        <a href={`/api/admin/topups/screenshot?id=${r.id}`} target="_blank" rel="noopener noreferrer" className="block w-40 overflow-hidden rounded-xl border border-[#E7E7EA]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/admin/topups/screenshot?id=${r.id}`} alt="Payment screenshot, open to enlarge" className="h-40 w-40 object-cover" />
        </a>
      </div>
      {r.status === "pending" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input aria-label="Note for the user (optional)" placeholder="Note (optional)" maxLength={200} className={`${input} !w-56`} value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="button" disabled={busy} onClick={() => act("approve")} className={btn}><Check size={16} /> Approve and add {r.tokens} tokens</button>
          <button type="button" disabled={busy} onClick={() => act("decline")} className={`${btnLight} hover:!border-red-500 hover:!text-red-600`}><X size={16} /> Decline</button>
        </div>
      )}
      {msg && <p role="alert" className="mt-3 text-sm text-red-600">{msg}</p>}
    </Card>
  );
}

export default function PaymentsPage() {
  const [status, setStatus] = useState("pending");
  const { data, error, loading, reload } = useApi<Row[]>(`/api/admin/topups?status=${status}`);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Payments</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Check the screenshot and your own account. Then approve to add the tokens.</p>
        </div>
        <select aria-label="Show" className={`${input} !w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Waiting</option><option value="approved">Approved</option><option value="declined">Declined</option><option value="all">All</option>
        </select>
      </div>
      <div className="mt-6 space-y-4">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && (data.length === 0 ? <Card><p className="text-sm text-[#6B6B6B]">Nothing here.</p></Card> : data.map((r) => <Item key={r.id} r={r} onDone={reload} />))}
      </div>
    </div>
  );
}
