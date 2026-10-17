"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { Card, ErrorBox, Skeleton, btn, btnLight, input, send, useApi } from "@/components/admin/ui";
import { useToast } from "@/components/website/Toast";
import { fileToJpegDataUrl } from "@/lib/content";
import type { PaymentMethod } from "@/lib/site-config";

type Info = { defaultPrice: number; minTopup: number; maxTopup: number; methods: PaymentMethod[] };
type Quote = { ok: true; tokens: number; discount: number; payable: number; coupon: string | null } | { ok: false; error: string };

function Form({ info }: { info: Info }) {
  const { show, node } = useToast();
  const [tokens, setTokens] = useState(String(info.minTopup));
  const [coupon, setCoupon] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [sent, setSent] = useState("");
  const [txn, setTxn] = useState("");
  const [shot, setShot] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/topup/quote?tokens=${encodeURIComponent(tokens)}&coupon=${encodeURIComponent(coupon)}`, { cache: "no-store" });
        setQuote((await r.json()) as Quote);
      } catch { setQuote({ ok: false, error: "Could not check right now." }); }
    }, 400);
    return () => clearTimeout(t);
  }, [tokens, coupon]);

  const copy = async (n: string) => { try { await navigator.clipboard.writeText(n); show("Number copied"); } catch { show("Copy failed"); } };
  const pick = async (f: File) => { try { setMsg(""); setShot(await fileToJpegDataUrl(f, 1400, 0.8)); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not use this picture."); } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!quote?.ok) return setMsg(quote?.error ?? "Choose how many tokens you want.");
    if (!shot) return setMsg("Please add the screenshot of your payment.");
    setBusy(true);
    try {
      await send("/api/topup", "POST", { tokens: Number(tokens), coupon: coupon.trim() || undefined, sentAmount: Number(sent), txnId: txn.trim() || undefined, screenshot: shot });
      setDone(true);
    } catch (err) { setMsg(err instanceof Error ? err.message : "Could not send your request."); }
    setBusy(false);
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h2 className="text-xl font-semibold">Request sent</h2>
        <p className="mt-2 text-sm text-[#3a3a3f]">We will check your payment and add the tokens to your account. This can take up to 24 hours. You can see the status in your account.</p>
        <Link href="/account" className={`${btn} mt-5`}>Go to my account</Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card title="1. How many tokens?">
          <label className="text-sm font-medium">Tokens (1 Rs = 1 token, {info.minTopup} to {info.maxTopup})
            <input inputMode="numeric" className={`${input} mt-1.5`} value={tokens} onChange={(e) => setTokens(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          </label>
          <label className="mt-4 block text-sm font-medium">Coupon code (optional)
            <input className={`${input} mt-1.5 uppercase`} maxLength={30} value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
          </label>
          <div className="mt-4 rounded-xl bg-[#F7F7F8] p-4 text-sm">
            {!quote ? "Checking..." : quote.ok ? (
              <>
                <p className="flex justify-between"><span>Tokens</span><b>{quote.tokens}</b></p>
                {quote.discount > 0 && <p className="mt-1 flex justify-between text-emerald-700"><span>Coupon discount</span><b>- Rs {quote.discount}</b></p>}
                <p className="mt-2 flex justify-between border-t border-[#E7E7EA] pt-2 text-base"><span>You pay</span><b>Rs {quote.payable}</b></p>
              </>
            ) : <p role="alert" className="text-red-600">{quote.error}</p>}
          </div>
        </Card>
        <Card title="2. Send the money to one of these">
          {info.methods.length === 0 ? <p className="text-sm text-[#6B6B6B]">Payment methods are not set up yet. Please try again later.</p> : (
            <ul className="space-y-3">
              {info.methods.map((m) => (
                <li key={m.label + m.number} className="rounded-xl border border-[#E7E7EA] p-4">
                  <p className="font-semibold">{m.label}</p>
                  {m.title && <p className="text-sm text-[#6B6B6B]">{m.title}</p>}
                  <p className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-wide">{m.number}
                    <button type="button" aria-label={`Copy ${m.label} number`} onClick={() => copy(m.number)} className="rounded-full border border-[#E7E7EA] p-1.5 hover:border-[#111111]"><Copy size={14} /></button>
                  </p>
                  {m.note && <p className="mt-1 text-xs text-[#6B6B6B]">{m.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <form onSubmit={submit}>
        <Card title="3. Tell us what you sent">
          <label className="text-sm font-medium">Amount you sent (Rs)
            <input required inputMode="numeric" className={`${input} mt-1.5`} value={sent} onChange={(e) => setSent(e.target.value.replace(/\D/g, "").slice(0, 7))} />
          </label>
          <label className="mt-4 block text-sm font-medium">Transaction ID (optional)
            <input maxLength={40} className={`${input} mt-1.5`} value={txn} onChange={(e) => setTxn(e.target.value)} />
          </label>
          <div className="mt-4">
            <p className="text-sm font-medium">Payment screenshot</p>
            {shot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot} alt="Your payment screenshot" className="mt-2 max-h-64 rounded-xl border border-[#E7E7EA]" />
            )}
            <button type="button" className={`${btnLight} mt-2`} onClick={() => file.current?.click()}>{shot ? "Change screenshot" : "Add screenshot"}</button>
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ""; }} />
          </div>
          {msg && <p role="alert" className="mt-4 text-sm text-red-600">{msg}</p>}
          <button type="submit" disabled={busy || !quote?.ok || info.methods.length === 0} className={`${btn} mt-5 w-full`}>{busy ? "Sending..." : "Send request"}</button>
          <p className="mt-3 text-xs text-[#6B6B6B]">We check every payment by hand. Please send the exact amount shown above. Tokens are added after we confirm it.</p>
        </Card>
      </form>
      {node}
    </div>
  );
}

export default function TopupView() {
  const { data, error, loading } = useApi<Info>("/api/topup/info");
  if (loading && !data) return <Skeleton />;
  if (error === "Please sign in.") {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-semibold">Please sign in</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">Sign in to buy tokens.</p>
        <Link href="/login?next=/topup" className={`${btn} mt-5`}>Sign in</Link>
      </Card>
    );
  }
  if (error || !data) return <ErrorBox message={error || "Could not load this page."} />;
  return <Form info={data} />;
}
