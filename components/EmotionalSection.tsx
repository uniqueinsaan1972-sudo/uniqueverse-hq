import { templates } from "@/data/templates";
import TemplatePreview from "./TemplatePreview";
import Reveal from "./Reveal";
import { container } from "@/lib/ui";

export default function EmotionalSection() {
  const t = templates.find((x) => x.id === "midnight-letter") ?? templates[0];
  return (
    <section className="pb-20 sm:pb-28">
      <div className={container}>
        <div className="grid items-center gap-12 rounded-[2rem] border border-[#E7E7EA] px-6 py-14 sm:px-12 lg:grid-cols-[1.2fr_1fr] lg:px-16">
          <Reveal>
            <h2 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Some moments deserve more than a message.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#6B6B6B]">
              A text can be forgotten.
              <br />
              A beautiful experience can become a memory.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center">
            <div className="w-[230px] rounded-[2.4rem] border-[7px] border-[#111111] bg-[#111111] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] sm:w-[260px]">
              <div className="overflow-hidden rounded-[1.9rem]">
                <TemplatePreview template={t} className="aspect-[9/17]" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
