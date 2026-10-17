"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Copy, ExternalLink, LogOut, QrCode, Wallet } from "lucide-react";
import { Card, ErrorBox, Skeleton, btn, btnLight, send, useApi, when } from "@/components/admin/ui";
import QrPreview from "@/components/website/QrPreview";
import { useToast } from "@/components/website/Toast";
import { browserAuth } from "@/lib/supabase-browser";
import { fileToJpegDataUrl } from "@/lib/content";
import { publicPath } from "@/lib/client";
import { useOrigin } from "@/lib/useOrigin";
import type { QrSettings } from "@/types/website";

type Me = {
  user: { id: string; email: string; name: string };
  balance: number;
  websites: { id: string; slug: string; templateId: string; createdAt: string; qr: QrSettings }[];
  topups: { id: string; tokens: number; payable: number; sent_amount: number; coupon: string | null; status: string; note: string | null; created_at: string }[];
};

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800", approved: "bg-emerald-50 text-emerald-700", declined: "bg-red-50 text-red-700",
};

function Avatar({ name, v }: { name: string; v: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E7E7EA] bg-[#F7F7F8] text-2xl font-semibold text-[#6B6B6B]">
      {broken ? (name.trim()[0] ?? "?").toUpperCase() : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={v} src={`/api/account/avatar?v=${v}`} alt="Your profile picture" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      )}
    </div>
  );
}

export default function AccountView() {
  const router = useRouter();
  const { data, error, loading } = useApi<Me>("/api/account/me");
  const origin = useOrigin();
  const { show, node } = useToast();
  const [v, setV] = useState(1);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  if (loading && !data) return <Skeleton />;
  if (error === "Please sign in.") {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-semibold">Please sign in</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">Sign in to see your websites, QR codes and tokens.</p>
        <Link href="/login?next=/account" className={`${btn} mt-5`}>Sign in</Link>
      </Card>
    );
  }
  if (error || !data) return <ErrorBox message={error || "Could not load your account."} />;

  const changePicture = async (f: File) => {
    setBusy(true);
    try {
      await send("/api/account/avatar", "POST", { image: await fileToJpegDataUrl(f, 400, 0.85) });
      setV((n) => n + 1); show("Picture updated");
    } catch (e) { show(e instanceof Error ? e.message : "Could not change the picture."); }
    setBusy(false);
  };
  const signOut = async () => { await browserAuth().auth.signOut(); router.replace("/"); router.refresh(); };
  const copy = async (slug: string) => {
    try { await navigator.clipboard.writeText(`${origin}${publicPath(slug)}`); show("Link copied!"); } catch { show("Copy failed. Select the link and copy it."); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            <Avatar name={data.user.name || data.user.email} v={v} />
            <button type="button" aria-label="Change profile picture" disabled={busy} onClick={() => file.current?.click()} className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E7EA] bg-white shadow-sm transition hover:border-[#111111] disabled:opacity-40">
              <Camera size={16} />
            </button>
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) changePicture(f); e.target.value = ""; }} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{data.user.name || "Your account"}</h1>
            <p className="truncate text-sm text-[#6B6B6B]">{data.user.email}</p>
          </div>
          <button type="button" onClick={signOut} className={btnLight}><LogOut size={16} /> Sign out</button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-white"><Wallet size={20} /></span>
            <div><p className="text-sm text-[#6B6B6B]">Your tokens</p><p className="text-3xl font-semibold tracking-tight">{data.balance}</p></div>
          </div>
          <Link href="/topup" className={btn}>Top up tokens</Link>
        </div>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">My websites</h2>
        {data.websites.length === 0 ? (
          <Card><p className="text-sm text-[#6B6B6B]">You have not made a website yet. <Link href="/templates" className="font-semibold underline">Choose a template</Link>.</p></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.websites.map((w) => (
              <Card key={w.id}>
                <div className="flex gap-4">
                  <div className="w-28 shrink-0 overflow-hidden rounded-lg border border-[#E7E7EA]"><QrPreview url={origin ? `${origin}${publicPath(w.slug)}` : ""} qr={w.qr} /></div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{w.slug}</p>
                    <p className="text-xs text-[#6B6B6B]">{w.templateId} - {when(w.createdAt)}</p>
                    <p className="mt-2 break-all text-xs text-[#6B6B6B]">{origin}{publicPath(w.slug)}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={publicPath(w.slug)} target="_blank" rel="noopener noreferrer" className={btnLight}><ExternalLink size={15} /> Open</a>
                  <button type="button" onClick={() => copy(w.slug)} className={btnLight}><Copy size={15} /> Copy link</button>
                  <Link href={`/website/${w.id}/qr`} className={btnLight}><QrCode size={15} /> Edit QR</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Token top-ups</h2>
        {data.topups.length === 0 ? (
          <Card><p className="text-sm text-[#6B6B6B]">No top-ups yet.</p></Card>
        ) : (
          <Card className="divide-y divide-[#F1F1F3] !p-0">
            {data.topups.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                <div><b>{t.tokens} tokens</b><span className="ml-2 text-[#6B6B6B]">Rs {t.payable}{t.coupon ? ` (coupon ${t.coupon})` : ""} - {when(t.created_at)}</span>{t.note && <p className="text-xs text-[#6B6B6B]">{t.note}</p>}</div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle[t.status] ?? ""}`}>{t.status}</span>
              </div>
            ))}
          </Card>
        )}
      </section>
      {node}
    </div>
  );
}
