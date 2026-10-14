"use client";
import { useState } from "react";
import { categories } from "@/data/categories";
import { useTemplates } from "@/lib/config-client";
import TemplateCard from "./TemplateCard";
import Reveal from "./Reveal";
import { container } from "@/lib/ui";

const pills = [{ id: "all", label: "All" }, ...categories];

export default function TemplateGrid() {
  const [active, setActive] = useState<string>("all");
  const templates = useTemplates();
  const list = active === "all" ? templates : templates.filter((t) => t.category === active);

  return (
    <section id="templates" className="py-20 sm:py-28">
      <div className={container}>
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Find the perfect experience</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#6B6B6B] sm:text-lg">
            Start with a template, then make it completely yours.
          </p>
        </Reveal>

        <div id="categories" className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {pills.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={active === p.id}
              onClick={() => setActive(p.id)}
              className={`h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition ${
                active === p.id
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#E7E7EA] bg-white text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-16 text-center text-[#6B6B6B]">More templates in this category are coming soon.</p>
        ) : (
          <div key={active} className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {list.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
