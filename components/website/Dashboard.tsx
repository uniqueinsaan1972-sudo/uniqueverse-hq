"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, ExternalLink, Download, Pencil, QrCode, Loader2 } from "lucide-react";
import { checkSlugRemote, patchWebsite, publicPath } from "@/lib/client";
import { buildQrSvg, download, svgToPngBlob } from "@/lib/qr";
import { useOrigin } from "@/lib/useOrigin";
import { container, btnPrimary, btnSecondary } from "@/lib/ui";
import QrPreview from "./QrPreview";
import { useToast } from "./Toast";
import { useWebsite } from "./useWebsite";

type SlugState = { kind: "idle" | "checking" | "ok" | "bad"; msg: string };

export default function Dashboard({ id, done }: { id: string; done?: string }) {
  const { site, setSite, state, message } = useWebsite(id);
  const origin = useOrigin();
  const { show, node } = useToast();
  const [slug, setSlug] = useState<string | null>(null);
  const [slugState, setSlugState] = useState<SlugState>({ kind: "idle", msg: "" });
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (state === "loading") return <div className={`${container} py-24 text-center text-[#6B6B6B]`}><Loader2 className="mx-auto animate-spin" /></div>;
  if (state === "error" || !site) {
    return (
      <div className={`${container} max-w-xl py-24 text-center`}>
        <h1 className="text-2xl font-semibold">We couldn&rsquo;t open this dashboard</h1>
        <p className="mt-3 text-[#6B6B6B]">{message}</p>
        <Link href="/templates" className={`${btnPrimary} mt-8`}>Browse templates</Link>
      </div>
    );
  }

  const value = slug ?? site.slug;
  const fullUrl = origin ? `${origin}${publicPath(site.slug)}` : "";

  const onSlug = (raw: string) => {
    const v = raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-").slice(0, 60);
    setSlug(v);
    clearTimeout(timer.current);
    if (v === site.slug) return setSlugState({ kind: "idle", msg: "" });
    setSlugState({ kind: "checking", msg: "Checking..." });
    timer.current = setTimeout(async () => {
      try {
        const r = await checkSlugRemote(v, site.id);
        setSlugState(r.valid && r.available ? { kind: "ok", msg: "This URL is available." } : { kind: "bad", msg: r.error ?? "Not available." });
      } catch { setSlugState({ kind: "bad", msg: "Could not check right now. Please try again." }); }
    }, 350);
  };

  const saveSlug = async () => {
    setSaving(true);
    try {
      const r = await patchWebsite(site.id, { slug: value });
      setSite(r.website); setSlug(null); setSlugState({ kind: "idle", msg: "" });
      show("URL updated. The QR code now points to it.");
    } catch (e) { setSlugState({ kind: "bad", msg: e instanceof Error ? e.message : "Could not save." }); }
    setSaving(false);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(fullUrl); show("Link copied!"); } catch { show("Copy failed. Select the link and copy it."); }
  };
  const downloadPng = async () => {
    try { download(await svgToPngBlob(buildQrSvg(fullUrl, site.qr)), `${site.slug}-qr.png`); } catch { show("Could not download the QR. Please try again."); }
  };

  const heading = done === "new" ? "Website generated successfully!" : done === "updated" ? "Website updated!" : "Your website";
  return (
    <main className={`${container} max-w-5xl py-10 sm:py-16`}>
      <div className="text-center">
        {done && (
          <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-white">
            <CheckCircle2 size={32} />
          </motion.div>
        )}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{done ? `🎉 ${heading}` : heading}</h1>
        <p className="mt-3 text-[#6B6B6B]">{done ? "Your birthday website is ready to share." : "Manage your link and QR code."}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F7F7F8] px-4 py-1.5 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Published</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-[#E7E7EA] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-base font-semibold">Public URL</h2>
          <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-[#E7E7EA] focus-within:border-[#111111] sm:flex-row">
            <span className="truncate bg-[#F7F7F8] px-4 py-3 text-sm text-[#6B6B6B]">{origin || "..."}/birthday/</span>
            <input aria-label="URL slug" value={value} onChange={(e) => onSlug(e.target.value)} className="min-w-0 flex-1 px-4 py-3 text-[15px] outline-none" />
          </div>
          <p role="status" className={`mt-2 min-h-5 text-sm ${slugState.kind === "ok" ? "text-emerald-600" : slugState.kind === "bad" ? "text-red-600" : "text-[#6B6B6B]"}`}>{slugState.msg}</p>
          <button type="button" onClick={saveSlug} disabled={slugState.kind !== "ok" || saving} className={`${btnSecondary} mt-2 disabled:pointer-events-none disabled:opacity-40`}>
            {saving ? "Saving..." : "Save URL"}
          </button>
          <p className="mt-3 text-xs text-[#6B6B6B]">If you change the URL, the old link redirects to the new one.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href={publicPath(site.slug)} target="_blank" rel="noopener noreferrer" className={btnPrimary}><ExternalLink size={16} /> Open Website</a>
            <button type="button" onClick={copy} className={btnSecondary}><Copy size={16} /> Copy Link</button>
            <Link href={`/customize/${site.templateId}`} className={btnSecondary}><Pencil size={16} /> Edit Website</Link>
            <Link href={`/website/${site.id}/qr`} className={btnSecondary}><QrCode size={16} /> Customize QR</Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E7E7EA] bg-white p-5 text-center shadow-sm sm:p-7">
          <h2 className="text-base font-semibold">QR Code</h2>
          <div className="mx-auto mt-4 max-w-[260px]"><QrPreview url={fullUrl} qr={site.qr} /></div>
          <p className="mt-3 text-sm text-[#6B6B6B]">Scan to open the website.</p>
          <button type="button" onClick={downloadPng} className={`${btnSecondary} mt-4 w-full`}><Download size={16} /> Download QR</button>
        </section>
      </div>
      {node}
    </main>
  );
}
