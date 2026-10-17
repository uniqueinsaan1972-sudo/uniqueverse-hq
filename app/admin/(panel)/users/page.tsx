"use client";
import { useState } from "react";
import { Card, ErrorBox, Skeleton, btn, input, send, useApi, when } from "@/components/admin/ui";

type User = { id: string; email: string; name: string; createdAt: string; lastSignIn: string | null; balance: number };

function Row({ u, onDone }: { u: User; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const apply = async () => {
    const n = Number(amount);
    if (!window.confirm(`${n > 0 ? "Add" : "Remove"} ${Math.abs(n)} tokens ${n > 0 ? "to" : "from"} ${u.email}?`)) return;
    try { await send("/api/admin/users", "POST", { userId: u.id, amount: n, reason }); setAmount(""); setReason(""); setMsg("Done."); onDone(); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not change."); }
  };
  return (
    <tr className="border-b border-[#F1F1F3] align-top last:border-0">
      <td className="px-4 py-3"><p className="font-medium">{u.name || "-"}</p><p className="text-xs text-[#6B6B6B]">{u.email}</p><p className="text-xs text-[#9a9aa2]">{u.id}</p></td>
      <td className="px-4 py-3 text-lg font-semibold">{u.balance}</td>
      <td className="px-4 py-3 text-xs text-[#6B6B6B]">{when(u.createdAt)}{u.lastSignIn && <><br />Last: {when(u.lastSignIn)}</>}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <input aria-label={`Tokens to add (use - to remove) for ${u.email}`} placeholder="+50 or -50" className={`${input} !h-9 !w-28`} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9-]/g, ""))} />
          <input aria-label="Reason" placeholder="Reason" maxLength={80} className={`${input} !h-9 !w-32`} value={reason} onChange={(e) => setReason(e.target.value)} />
          <button type="button" disabled={!amount || amount === "-"} onClick={apply} className={`${btn} !h-9 !px-4`}>Apply</button>
        </div>
        {msg && <p role="status" className="mt-1 text-xs text-[#6B6B6B]">{msg}</p>}
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const { data, error, loading, reload } = useApi<User[]>("/api/admin/users");
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Everyone who made an account, and how many tokens they have. You can add or remove tokens by hand.</p>
      <div className="mt-6 space-y-4">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && (data.length === 0 ? <Card><p className="text-sm text-[#6B6B6B]">No users yet.</p></Card> : (
          <Card className="overflow-x-auto !p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#E7E7EA] text-xs text-[#6B6B6B]"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Tokens</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Change tokens</th></tr></thead>
              <tbody>{data.map((u) => <Row key={u.id} u={u} onDone={reload} />)}</tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
}
