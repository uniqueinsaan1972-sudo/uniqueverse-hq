import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { templates, getTemplateById } from "@/data/templates";
import { categoryLabel } from "@/lib/templates";
import PreviewStage from "@/components/PreviewStage";
import MarketplaceCard from "@/components/MarketplaceCard";
import { container, btnPrimary } from "@/lib/ui";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export default function TemplatePreviewPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PreviewContent params={params} />
    </Suspense>
  );
}

async function PreviewContent({ params }: Props) {
  const { id } = await params;
  const template = getTemplateById(id);
  if (!template) notFound();

  const more = [
    ...templates.filter((t) => t.id !== template.id && t.category === template.category),
    ...templates.filter((t) => t.id !== template.id && t.category !== template.category),
  ].slice(0, 4);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E7E7EA] bg-white/85 backdrop-blur-xl">
        <div className={`${container} flex h-16 items-center gap-3`}>
          <Link
            href="/templates"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#E7E7EA] px-4 text-sm font-medium transition hover:border-[#111111]"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="truncate text-base font-semibold tracking-tight">{template.name}</h1>
            <span className="hidden shrink-0 rounded-full bg-[#F7F7F8] px-2.5 py-1 text-xs font-medium text-[#6B6B6B] sm:inline">
              {categoryLabel(template.category)}
            </span>
          </div>
          <Link
            href={`/customize/${template.id}`}
            className="inline-flex h-10 shrink-0 items-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
          >
            <span className="sm:hidden">Personalize</span>
            <span className="hidden sm:inline">Personalize This Template</span>
          </Link>
        </div>
      </header>

      <main className={`${container} py-10 sm:py-14`}>
        <PreviewStage template={template} />

        <div className="mx-auto mt-12 max-w-xl text-center">
          <p className="text-[#6B6B6B]">{template.description}</p>
          <Link href={`/customize/${template.id}`} className={`${btnPrimary} mt-6`}>
            Personalize This Template
          </Link>
        </div>

        <section className="mt-20" aria-labelledby="more-heading">
          <h2 id="more-heading" className="mb-8 text-2xl font-semibold tracking-tight">More to explore</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {more.map((t, i) => (
              <MarketplaceCard key={t.id} template={t} index={i} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
