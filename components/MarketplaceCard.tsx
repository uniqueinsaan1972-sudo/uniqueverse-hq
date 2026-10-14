"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Template } from "@/types/template";
import { categoryLabel } from "@/lib/templates";
import TemplatePreview from "./TemplatePreview";

/** Card used on /templates and the preview page.
 *  Hover devices (md+): buttons slide in over the preview.
 *  Touch devices / phones: buttons sit under the card so they are always reachable. */
export default function MarketplaceCard({ template, index = 0 }: { template: Template; index?: number }) {
  const previewHref = `/templates/${template.id}`;
  const customizeHref = `/customize/${template.id}`;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#E7E7EA] shadow-sm transition-all duration-300 group-focus-within:-translate-y-1 group-hover:-translate-y-1 group-hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.3)]">
        <Link href={previewHref} aria-label={`Preview ${template.name}`} className="block">
          <div className="transition duration-500 group-hover:scale-[1.04] group-hover:brightness-105">
            <TemplatePreview template={template} />
          </div>
        </Link>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 gap-2 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)_and_(min-width:768px)]:flex">
          <Link href={previewHref} className="pointer-events-auto inline-flex h-9 flex-1 items-center justify-center rounded-full bg-white/95 text-[13px] font-semibold text-[#111111] transition hover:bg-white">
            Preview
          </Link>
          <Link href={customizeHref} className="pointer-events-auto inline-flex h-9 flex-1 items-center justify-center rounded-full bg-[#111111] text-[13px] font-semibold text-white transition hover:bg-black">
            Personalize
          </Link>
        </div>
      </div>

      <div className="mt-4 px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight">{template.name}</h3>
          <span className="shrink-0 rounded-full bg-[#F7F7F8] px-2.5 py-1 text-xs font-medium text-[#6B6B6B]">
            {categoryLabel(template.category)}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B6B]">{template.description}</p>
        <div className="mt-4 flex gap-2 [@media(hover:hover)_and_(min-width:768px)]:hidden">
          <Link href={previewHref} className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[#D9D9DE] bg-white text-sm font-semibold transition active:scale-[0.98]">
            Preview
          </Link>
          <Link href={customizeHref} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#111111] text-sm font-semibold text-white transition active:scale-[0.98]">
            Personalize <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
