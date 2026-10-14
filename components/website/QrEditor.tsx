"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, TriangleAlert } from "lucide-react";
import { QR_ALIGNS, QR_FRAMES, QR_STYLES, type GeneratedWebsite, type QrSettings } from "@/types/website";
import { patchWebsite, publicPath } from "@/lib/client";
import { buildQrSvg, contrastWarning, download, svgToPngBlob } from "@/lib/qr";
import { useOrigin } from "@/lib/useOrigin";
import { container, btnPrimary, btnSecondary } from "@/lib/ui";
import { TextInput, Toggle, Section } from "@/components/customize/Controls";
import QrPreview from "./QrPreview";
import { useToast } from "./Toast";
import { useWebsite } from "./useWebsite";

function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}
            className={`h-10 rounded-full border px-4 text-sm font-medium capitalize transition ${value === o ? "border-[#111111] bg-[#111111] text-white" : "border-[#E7E7EA] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-[#E7E7EA] p-2.5 text-sm font-medium">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0" />
      <span>{label}<span className="block text-xs font-normal uppercase text-[#6B6B6B]">{value}</span></span>
    </label>
  );
}

function Form({ site }: { site: GeneratedWebsite }) {
  const [qr, setQr] = useState<QrSettings>(site.qr);
  const [saved, setSaved] = useState<QrSettings>(site.qr);
  const [saving, setSaving] = useState(false);
  const origin = useOrigin();
  const { show, node } = useToast();
  const url = origin ? `${origin}${publicPath(site.slug)}` : "";
  const set = <K extends keyof QrSettings>(k: K, v: QrSettings[K]) => setQr((q) => ({ ...q, [k]: v }));
  const warn = contrastWarning(qr.foreground, qr.background);
  const dirty = JSON.stringify(qr) !== JSON.stringify(saved);

  const save = async () => {
    setSaving(true);
    try { const r = await patchWebsite(site.id, { qr }); setSaved(r.website.qr); show("QR saved"); } catch (e) { show(e instanceof Error ? e.message : "Could not save the QR."); }
    setSaving(false);
  };
  const png = async () => { try { download(await svgToPngBlob(buildQrSvg(url, qr)), `${site.slug}-qr.png`); } catch { show("Could not download the QR."); } };
  const svg = () => { try { download(new Blob([buildQrSvg(url, qr)], { type: "image/svg+xml" }), `${site.slug}-qr.svg`); } catch { show("Could not download the QR."); } };

  return (
    <main className={`${container} py-8 sm:py-12`}>
      <Link href={`/website/${site.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#6B6B6B] hover:text-[#111111]"><ArrowLeft size={16} /> Back to your website</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Customize QR</h1>
      <p className="mt-2 text-[#6B6B6B]">The QR always points to <span className="break-all font-medium text-[#111111]">{url || "your link"}</span></p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <div className="order-2 space-y-5 lg:order-1">
          <Section title="Design">
            <Seg label="Style" value={qr.style} options={QR_STYLES} onChange={(v) => set("style", v)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="QR color" value={qr.foreground} onChange={(v) => set("foreground", v)} />
              <ColorField label="Background" value={qr.background} onChange={(v) => set("background", v)} />
            </div>
            {warn && <p role="alert" className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><TriangleAlert size={18} className="mt-0.5 shrink-0" /> {warn}</p>}
            <Seg label="Frame" value={qr.frame} options={QR_FRAMES} onChange={(v) => set("frame", v)} />
          </Section>
          <Section title="Text" hint="Text appears below the QR, outside the scanning area.">
            <Toggle label="Show text" checked={qr.showText} onChange={(v) => set("showText", v)} />
            {qr.showText && (
              <>
                <TextInput label="Text" value={qr.text} onChange={(v) => set("text", v.slice(0, 40))} placeholder="Scan Me ❤️" />
                <TextInput label="Caption" value={qr.caption} onChange={(v) => set("caption", v.slice(0, 70))} placeholder="Open Alina's Birthday Surprise" />
                <Seg label="Alignment" value={qr.align} options={QR_ALIGNS} onChange={(v) => set("align", v)} />
              </>
            )}
          </Section>
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2">
          <div className="rounded-2xl border border-[#E7E7EA] bg-[#F7F7F8] p-5 sm:p-8">
            <div className="mx-auto max-w-[340px] overflow-hidden rounded-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]"><QrPreview url={url} qr={qr} /></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={save} disabled={!dirty || saving} className={`${btnPrimary} col-span-2 disabled:pointer-events-none disabled:opacity-40`}>
              {saving ? "Saving..." : dirty ? "Save QR" : "Saved"}
            </button>
            <button type="button" onClick={png} className={btnSecondary}><Download size={16} /> PNG</button>
            <button type="button" onClick={svg} className={btnSecondary}><Download size={16} /> SVG</button>
          </div>
          <p className="mt-3 text-xs text-[#6B6B6B]">PNG is 2400 px wide, good for printing. SVG stays sharp at any size.</p>
        </div>
      </div>
      {node}
    </main>
  );
}

export default function QrEditor({ id }: { id: string }) {
  const { site, state, message } = useWebsite(id);
  if (state === "loading") return <div className={`${container} py-24 text-center`}><Loader2 className="mx-auto animate-spin" /></div>;
  if (state === "error" || !site) return <div className={`${container} max-w-xl py-24 text-center`}><h1 className="text-2xl font-semibold">We couldn&rsquo;t open this page</h1><p className="mt-3 text-[#6B6B6B]">{message}</p></div>;
  return <Form site={site} />;
}
