"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Template } from "@/types/template";
import { categories } from "@/data/categories";
import TemplatePreview from "./TemplatePreview";

export default function TemplateCard({ template, index }: { template: Template; index: number }) {
  const label = categories.find((c) => c.id === template.category)?.label ?? template.category;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#E7E7EA] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.3)]">
        <div className="transition duration-500 group-hover:scale-[1.04] group-hover:brightness-105">
          <TemplatePreview template={template} />
        </div>
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-2 gap-2 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition duration-300 focus-within:translate-y-0 focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          <button type="button" className="h-9 flex-1 rounded-full bg-white/95 text-[13px] font-semibold text-[#111111] transition hover:bg-white">
            Preview
          </button>
          <button type="button" className="h-9 flex-1 rounded-full bg-[#111111] text-[13px] font-semibold text-white transition hover:bg-black">
            Use Template
          </button>
        </div>
      </div>
      <div className="mt-4 px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight">{template.name}</h3>
          <span className="shrink-0 rounded-full bg-[#F7F7F8] px-2.5 py-1 text-xs font-medium text-[#6B6B6B]">{label}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B6B]">{template.description}</p>
        <button type="button" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold md:hidden">
          Use Template <ArrowRight size={15} />
        </button>
      </div>
    </motion.article>
  );
}
