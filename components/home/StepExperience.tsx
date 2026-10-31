"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import type { Template } from "@/types/template";
import type { TemplateContent } from "@/types/content";
import { defaultQr } from "@/types/website";
import { useCategories, useCategoryLabel, useTemplates } from "@/lib/config-client";
import { getContentConfig } from "@/data/templateContent";
import { cloneContent, slotName } from "@/lib/content";
import { useOrigin } from "@/lib/useOrigin";
import { container } from "@/lib/ui";
import TemplatePreview from "@/components/TemplatePreview";
import TemplateFrame from "@/components/TemplateFrame";
import QrPreview from "@/components/website/QrPreview";
import { TextArea, TextInput } from "@/components/customize/Controls";

const STEPS = [
  { title: "Choose Your Style", text: "Find a design that matches your moment.", short: "Choose" },
  { title: "Make It Personal", text: "Add their name, your message, your photos, and the details that make it yours.", short: "Customize" },
  { title: "Ready to Share", text: "Publish your creation and share a personal link or QR code.", short: "Share" },
];

const stageBtn = "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-[#111111] transition hover:bg-[#E7E7EA] active:scale-[0.98]";

/* ---------- step 1: choose ---------- */
function Choose({ list, selected, onSelect, filter, setFilter, cats, onNext }: {
  list: Template[]; selected: Template | undefined; onSelect: (id: string) => void; filter: string; setFilter: (f: string) => void;
  cats: { id: string; label: string }[]; onNext: () => void;
}) {
  const reduce = useReducedMotion();
  const label = useCategoryLabel();
  const track = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const idx = selected ? list.findIndex((t) => t.id === selected.id) : -1;

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const c = track.current;
    const el = selected ? c?.querySelector<HTMLElement>(`[data-id="${selected.id}"]`) : null;
    if (c && el) c.scrollTo({ left: el.offsetLeft - (c.clientWidth - el.clientWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  }, [selected, reduce]);

  const step = (d: number) => { if (list.length) onSelect(list[(idx + d + list.length) % list.length].id); };
  const chips = [{ id: "all", label: "All" }, ...cats];

  return (
    <div>
      <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto sm:flex-wrap" role="group" aria-label="Filter by category">
        {chips.map((c) => (
          <button key={c.id} type="button" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}
            className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition ${filter === c.id ? "border-white bg-white text-[#111111]" : "border-white/25 text-white/70 hover:border-white/60 hover:text-white"}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="relative mt-6">
        <div ref={track} className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-6" role="listbox" aria-label="Templates">
          {list.map((t) => {
            const on = selected?.id === t.id;
            return (
              <button key={t.id} type="button" role="option" aria-selected={on} data-id={t.id} onClick={() => onSelect(t.id)}
                className="w-[62vw] max-w-[250px] shrink-0 snap-center text-left sm:w-[230px]">
                <div className="overflow-hidden rounded-xl transition duration-300"
                  style={{
                    filter: on ? "none" : "grayscale(1) brightness(0.55)",
                    transform: on ? "scale(1.04)" : "scale(1)",
                    boxShadow: on ? `0 0 0 2px ${t.theme.accent}, 0 22px 55px -18px ${t.theme.accent}` : "none",
                  }}>
                  <TemplatePreview template={t} />
                </div>
                <p className={`mt-3 text-sm font-semibold ${on ? "text-white" : "text-white/55"}`}>{t.name}</p>
                <p className={`text-xs ${on ? "text-white/70" : "text-white/40"}`}>{label(t.category)}</p>
              </button>
            );
          })}
        </div>
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous template" className="absolute left-0 top-[38%] hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/30 bg-[#111111] text-white transition hover:border-white sm:flex"><ArrowLeft size={18} /></button>
            <button type="button" onClick={() => step(1)} aria-label="Next template" className="absolute right-0 top-[38%] hidden h-11 w-11 translate-x-1/2 items-center justify-center rounded-full border border-white/30 bg-[#111111] text-white transition hover:border-white sm:flex"><ArrowRight size={18} /></button>
          </>
        )}
      </div>

      {selected ? (
        <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight">{selected.name}</p>
            <p className="mt-1 text-sm text-white/65">{selected.description}</p>
            <p className="mt-2 inline-block rounded-full border border-white/25 px-3 py-1 text-xs text-white/80">{selected.previewUrl ? "Ready to publish" : "Preview only for now"}</p>
          </div>
          <button type="button" onClick={onNext} className={`${stageBtn} shrink-0`}>Continue to Customize <ArrowRight size={18} /></button>
        </div>
      ) : (
        <p className="text-sm text-white/65">No templates in this category yet.</p>
      )}
    </div>
  );
}

/* ---------- step 2: customize (same content model and live preview the real editor uses) ---------- */
function Customize({ template, onNext }: { template: Template; onNext: () => void }) {
  const config = useMemo(() => getContentConfig(template), [template]);
  const [content, setContent] = useState<TemplateContent>(() => cloneContent(config.defaults));
  const { fields } = config;
  const mainDefault = config.defaults.names.main;
  const themed: Template = {
    ...template,
    previewTitle: fields.names ? template.previewTitle.replace(mainDefault, slotName(content, config.nameSlots[0].id)) : template.previewTitle,
    previewSubtitle: content.wish,
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
      <div className="rounded-2xl bg-white p-5 text-[#111111] sm:p-6">
        <p className="text-sm font-semibold">Try it with {template.name}</p>
        <p className="mt-1 text-xs text-[#6B6B6B]">Type below and watch the preview change. Nothing is saved here. The full editor opens when you continue.</p>
        <div className="mt-5 space-y-4">
          {fields.names && <TextInput label="Name" value={content.names.main} onChange={(v) => setContent((c) => ({ ...c, names: { ...c.names, main: v.slice(0, 60) } }))} />}
          {fields.wish && <TextArea label={config.wishLabel ?? "Message"} value={content.wish} onChange={(v) => setContent((c) => ({ ...c, wish: v.slice(0, 600) }))} />}
          {fields.gallery && content.gallery.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-medium">Photos</p>
              <ul className="grid grid-cols-4 gap-2">
                {content.gallery.slice(0, 4).map((g, i) => (
                  <li key={i} className="aspect-square overflow-hidden rounded-lg border border-[#E7E7EA] bg-[#F7F7F8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs text-[#6B6B6B]">Sample photos. Replace them with your own in the editor.</p>
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" onClick={onNext} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111111] px-7 text-[15px] font-semibold text-white transition hover:bg-[#2a2a2a]">Continue to Preview <ArrowRight size={18} /></button>
          <Link href={`/customize/${template.id}`} className="text-sm font-semibold underline">Open the full editor</Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white">
        <div className="flex items-center gap-1.5 border-b border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" /><span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" /><span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
          <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[11px] text-[#6B6B6B]">Live preview</span>
        </div>
        {template.previewUrl ? (
          <TemplateFrame src={template.previewUrl} title={`${template.name} live preview`} content={content} nameSlots={config.nameSlots} loading="lazy" className="h-[380px] w-full border-0 sm:h-[440px]" />
        ) : (
          <TemplatePreview template={themed} className="aspect-[4/3]" />
        )}
      </div>
    </div>
  );
}

/* ---------- step 3: share ---------- */
function Share({ template }: { template: Template }) {
  const origin = useOrigin();
  const [copied, setCopied] = useState(false);
  const previewLink = origin ? `${origin}/templates/${template.id}` : "";
  const copy = async () => {
    try { await navigator.clipboard.writeText(previewLink); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white">
        <div className="flex items-center gap-1.5 border-b border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" /><span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" /><span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
          <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-[#6B6B6B]">{origin ? `${origin.replace(/^https?:\/\//, "")}/birthday/your-link` : "your-link"}</span>
        </div>
        <TemplatePreview template={template} />
        <p className="border-t border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2 text-[11px] text-[#6B6B6B]">Example. You choose your own link name when you publish.</p>
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tight">What you get when you publish</p>
        <ul className="mt-4 space-y-3 text-sm text-white/80">
          <li className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0" /> A personal website made from your words and photos.</li>
          <li className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0" /> A link you can send by message, plus a QR code you can print.</li>
          <li className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0" /> You choose the link name and the QR style before you share.</li>
        </ul>
        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white p-4 text-[#111111]">
          <div className="w-28 shrink-0 overflow-hidden rounded-lg border border-[#E7E7EA]"><QrPreview url={previewLink} qr={{ ...defaultQr, text: "Sample", caption: "" }} /></div>
          <div className="min-w-0 text-sm">
            <p className="font-semibold">Sample QR code</p>
            <p className="mt-1 text-xs text-[#6B6B6B]">This one opens this template&rsquo;s preview. Your own QR code points to your website.</p>
            <button type="button" onClick={copy} disabled={!previewLink} className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-[#D9D9DE] px-4 text-[13px] font-semibold transition hover:border-[#111111] disabled:opacity-40">
              {copied ? <Check size={14} /> : <Copy size={14} />} <span className="whitespace-nowrap">{copied ? "Copied" : "Copy link"}</span>
            </button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          {template.previewUrl ? (
            <Link href={`/customize/${template.id}`} className={stageBtn}>Create Your Website <ArrowRight size={18} /></Link>
          ) : (
            <>
              <Link href={`/templates/${template.id}`} className={stageBtn}>Preview this template</Link>
              <p className="text-sm text-white/65">Publishing for this template is coming soon.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- the whole experience ---------- */
export default function StepExperience() {
  const templates = useTemplates();
  const cats = useCategories();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("all");

  const present = cats.filter((c) => templates.some((t) => t.category === c.id));
  const list = filter === "all" ? templates : templates.filter((t) => t.category === filter);
  const selected = list.find((t) => t.id === selectedId) ?? list.find((t) => t.previewUrl) ?? list[0];

  const go = (to: number) => { if (to < 0 || to > 2 || to === step) return; setDir(to > step ? 1 : -1); setStep(to); };
  const canNext = step === 0 ? Boolean(selected) : step < 2;
  const info = STEPS[step];

  return (
    <section id="start" className="pb-20 sm:pb-28" aria-labelledby="steps-title">
      <div className={container}>
        <div className="rounded-[2rem] bg-[#111111] px-5 py-8 text-white sm:px-10 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/60" aria-live="polite">Step {step + 1} of 3</p>
              <h2 id="steps-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{info.title}</h2>
              <p className="mt-3 max-w-xl text-base text-white/70">{info.text}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Previous step" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition hover:border-white disabled:pointer-events-none disabled:opacity-30"><ArrowLeft size={18} /></button>
              <button type="button" onClick={() => go(step + 1)} disabled={!canNext} aria-label="Next step" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition hover:border-white disabled:pointer-events-none disabled:opacity-30"><ArrowRight size={18} /></button>
            </div>
          </div>

          <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s.short}>
                <button type="button" onClick={() => (i === 0 || selected) && go(i)} aria-current={i === step ? "step" : undefined} className="block w-full text-left">
                  <span className={`block h-1 rounded-full transition-colors ${i <= step ? "bg-white" : "bg-white/20"}`} />
                  <span className={`mt-2 block text-xs font-medium ${i === step ? "text-white" : "text-white/50"}`}>{`0${i + 1}`} {s.short}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-8 min-h-[22rem]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={step} custom={dir}
                initial={{ opacity: 0, x: reduce ? 0 : dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : -dir * 24 }} transition={{ duration: 0.22 }}>
                {step === 0 && <Choose list={list} selected={selected} onSelect={setSelectedId} filter={filter} setFilter={setFilter} cats={present} onNext={() => go(1)} />}
                {step === 1 && selected && <Customize key={selected.id} template={selected} onNext={() => go(2)} />}
                {step === 2 && selected && <Share template={selected} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
