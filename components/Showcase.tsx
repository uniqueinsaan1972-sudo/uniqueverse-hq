"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { templates } from "@/data/templates";
import type { Template } from "@/types/template";
import TemplatePreview from "./TemplatePreview";
import Reveal from "./Reveal";
import { container } from "@/lib/ui";

const ids = ["birthday-neon", "dear-you", "best-friends-club", "forever-yours", "our-memories", "midnight-letter"];
const items = ids
  .map((id) => templates.find((t) => t.id === id))
  .filter((t): t is Template => Boolean(t));

export default function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  return (
    <section className="pb-20 sm:pb-28">
      <div className={container}>
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">See what you can create</h2>
            <p className="mt-3 max-w-lg text-[#6B6B6B]">Every experience is a small website, made around one person.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => scroll(-1)} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E7EA] transition hover:border-[#111111]">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E7EA] transition hover:border-[#111111]">
              <ChevronRight size={20} />
            </button>
          </div>
        </Reveal>
      </div>
      <div ref={ref} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-6 sm:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {items.map((t) => (
          <div key={t.id} className="w-[78%] shrink-0 snap-start sm:w-[360px]">
            <div className="overflow-hidden rounded-2xl border border-[#E7E7EA] shadow-sm">
              <TemplatePreview template={t} />
            </div>
            <p className="mt-3 px-1 text-sm font-semibold">{t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
