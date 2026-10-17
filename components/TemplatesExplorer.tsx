"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Sparkles } from "lucide-react";
import { useCategories, useCategoryLabel, useTemplates } from "@/lib/config-client";
import { filterTemplates } from "@/lib/templates";
import MarketplaceCard from "./MarketplaceCard";
import TemplatePreview from "./TemplatePreview";
import Reveal from "./Reveal";
import { container, btnPrimary, btnSecondary } from "@/lib/ui";


export default function TemplatesExplorer() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");
  const templates = useTemplates();
  const categoryLabel = useCategoryLabel();
  const pills = [{ id: "all", label: "All" }, ...useCategories()];
  const results = useMemo(() => filterTemplates(templates, query, active, categoryLabel), [templates, query, active, categoryLabel]);
  const featured = templates.find((t) => t.featured) ?? templates[0];
  const isBrowsing = active === "all" && query.trim() === "";
  const reset = () => {
    setQuery("");
    setActive("all");
  };

  return (
    <>
      {/* Hero + search */}
      <section className="relative bg-[radial-gradient(70%_55%_at_50%_0%,#F1F1F3,transparent)] pb-8 pt-14 sm:pb-10 sm:pt-20">
        <div className={`${container} text-center`}>
          <Reveal>
            <h1 className="mx-auto max-w-3xl text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Find something worth remembering.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6B6B6B] sm:text-lg">
              Explore beautiful experiences designed for birthdays, friendships, love, memories and every moment that deserves something special.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mx-auto mt-9 w-full max-w-xl">
              <label htmlFor="template-search" className="sr-only">Search templates</label>
              <Search size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" aria-hidden="true" />
              <input
                id="template-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates..."
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 w-full rounded-full border border-[#E7E7EA] bg-white pr-12 text-base shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] outline-none transition placeholder:text-[#9A9AA2] focus:border-[#111111] [&::-webkit-search-cancel-button]:hidden"
                style={{ paddingLeft: "3.25rem" }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#6B6B6B] transition hover:bg-[#F7F7F8] hover:text-[#111111]"
                >
                  <X size={18} />
                </button>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      {/* Category pills (sticky under the navbar) */}
      <div className="sticky top-16 z-40 border-b border-[#E7E7EA]/70 bg-white/85 backdrop-blur-xl">
        <div className={container}>
          <div
            role="group"
            aria-label="Filter by category"
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-3 sm:mx-0 sm:px-0"
          >
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
        </div>
      </div>

      {/* Featured */}
      {isBrowsing && featured && (
        <section aria-labelledby="featured-heading" className={`${container} pt-10 sm:pt-14`}>
          <div className="grid items-center gap-8 rounded-[2rem] bg-[#F7F7F8] p-5 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:p-12">
            <Reveal>
              <Link href={`/templates/${featured.id}`} aria-label={`Preview ${featured.name}`} className="group relative block">
                <span className="absolute right-3 top-12 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <Sparkles size={13} /> Featured
                </span>
                <div className="overflow-hidden rounded-2xl border border-[#E7E7EA] bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.3)] transition duration-500 group-hover:-translate-y-1">
                  <div className="flex items-center gap-1.5 border-b border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
                  </div>
                  <TemplatePreview template={featured} className="aspect-[16/11]" />
                </div>
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B]">Featured Experience</p>
              <h2 id="featured-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{featured.name}</h2>
              <span className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6B6B6B] ring-1 ring-[#E7E7EA]">
                {categoryLabel(featured.category)}
              </span>
              <p className="mt-4 max-w-md text-[#6B6B6B]">
                {featured.description} Add their photos, your words and the moments you shared.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/templates/${featured.id}`} className={btnSecondary}>Preview</Link>
                <Link href={`/customize/${featured.id}`} className={btnPrimary}>Personalize</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Grid / empty state */}
      <section id="all-templates" className={`${container} py-12 sm:py-16`}>
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {active === "all" ? "All experiences" : `${categoryLabel(active)} experiences`}
          </h2>
          <p className="text-sm text-[#6B6B6B]" aria-live="polite">
            {results.length} {results.length === 1 ? "experience" : "experiences"}
            {query.trim() && <> for &ldquo;{query.trim()}&rdquo;</>}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F7F8] text-[#6B6B6B]">
              <Search size={22} />
            </span>
            <h3 className="mt-6 text-xl font-semibold">No experiences found</h3>
            <p className="mt-2 text-[#6B6B6B]">Try another search or explore a different category.</p>
            <button type="button" onClick={reset} className={`${btnPrimary} mt-8`}>
              View All Templates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((t, i) => (
              <MarketplaceCard key={t.id} template={t} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
