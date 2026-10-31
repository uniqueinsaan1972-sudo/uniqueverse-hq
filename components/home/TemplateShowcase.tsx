"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCategoryLabel, useTemplates } from "@/lib/config-client";
import TemplatePreview from "@/components/TemplatePreview";
import Reveal from "@/components/Reveal";
import { container, btnPrimary, btnSecondary } from "@/lib/ui";

export default function TemplateShowcase() {
  const templates = useTemplates();
  const label = useCategoryLabel();
  const [activeId, setActiveId] = useState("");
  const active = templates.find((t) => t.id === activeId) ?? templates.find((t) => t.previewUrl) ?? templates[0];

  return (
    <section id="templates" className="pb-20 sm:pb-28" aria-labelledby="showcase-title">
      <span id="categories" aria-hidden />
      <div className={container}>
        <Reveal className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 id="showcase-title" className="text-3xl font-semibold tracking-tight sm:text-5xl">Find the Perfect Template</h2>
            <p className="mt-4 max-w-xl text-base text-[#6B6B6B] sm:text-lg">From unforgettable birthdays to heartfelt letters, start with a design that feels right.</p>
          </div>
          <Link href="/templates" className={`${btnSecondary} shrink-0`}>Explore All Templates <ArrowRight size={18} /></Link>
        </Reveal>

        <div className="no-scrollbar -mx-5 mt-10 flex snap-x gap-5 overflow-x-auto px-5 py-10 sm:mx-0 sm:px-4" role="list" aria-label="Templates">
          {templates.map((t, i) => {
            const on = active?.id === t.id;
            return (
              <div key={t.id} role="listitem" className="w-[66vw] max-w-[280px] shrink-0 snap-center sm:w-[260px]">
                <div className={`transition duration-300 ${on ? "z-10 scale-[1.04] rotate-0" : i % 2 ? "rotate-[2.5deg]" : "-rotate-[2.5deg]"}`}>
                  <button type="button" onClick={() => setActiveId(t.id)} aria-pressed={on} aria-label={`Select ${t.name}`}
                    className={`group block w-full overflow-hidden rounded-xl border bg-white text-left transition duration-300 ${on ? "border-[#111111] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.5)]" : "border-[#E7E7EA] shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)]"}`}>
                    <div className={`transition duration-300 ${on ? "" : "grayscale brightness-[0.62] group-hover:grayscale-0 group-hover:brightness-100 group-focus-visible:grayscale-0 group-focus-visible:brightness-100"}`}>
                      <TemplatePreview template={t} />
                    </div>
                  </button>
                </div>
                <div className="mt-5 px-1">
                  <p className="font-semibold tracking-tight">{t.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{label(t.category)}</p>
                  {t.previewUrl ? (
                    <Link href={`/customize/${t.id}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold underline">Customize <ArrowRight size={14} /></Link>
                  ) : (
                    <Link href={`/templates/${t.id}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B6B6B] underline">Preview (coming soon to publish)</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {active && (
          <Reveal className="mt-2 flex flex-col gap-5 rounded-2xl border border-[#E7E7EA] bg-[#F7F7F8] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#6B6B6B]">Selected</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">{active.name}</p>
              <p className="mt-1 max-w-lg text-sm text-[#6B6B6B]">{active.description}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href={`/templates/${active.id}`} className={btnSecondary}>Preview</Link>
              {active.previewUrl ? <Link href={`/customize/${active.id}`} className={btnPrimary}>Customize this template</Link> : <span className="inline-flex h-12 items-center text-sm text-[#6B6B6B]">Publishing coming soon</span>}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
