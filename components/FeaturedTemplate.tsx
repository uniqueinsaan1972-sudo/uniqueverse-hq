import { Check } from "lucide-react";
import { getFeaturedTemplate } from "@/data/templates";
import TemplatePreview from "./TemplatePreview";
import Reveal from "./Reveal";
import { container, btnPrimary } from "@/lib/ui";

const features = [
  "Add personal photos",
  "Write a custom message",
  "Add memories",
  "Personalize the experience",
  "Get a shareable link",
  "Generate a QR code",
];

export default function FeaturedTemplate() {
  const t = getFeaturedTemplate();
  return (
    <section className="pb-20 sm:pb-28">
      <div className={container}>
        <div className="grid items-center gap-10 rounded-[2rem] bg-[#F7F7F8] p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-[#E7E7EA] bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-1.5 border-b border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
              </div>
              <TemplatePreview template={t} className="aspect-[16/11]" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Made for the moments that matter.</h2>
            <h3 className="mt-6 text-xl font-semibold">Birthday Memories</h3>
            <p className="mt-2 max-w-md text-[#6B6B6B]">
              A personalized birthday experience built around their photos, your words and the moments you shared.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[15px]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button type="button" className={`${btnPrimary} mt-9`}>Create with this template</button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
