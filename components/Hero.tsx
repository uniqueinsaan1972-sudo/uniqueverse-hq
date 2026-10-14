import { templates } from "@/data/templates";
import type { Template } from "@/types/template";
import TemplatePreview from "./TemplatePreview";
import Reveal from "./Reveal";
import { ArrowRight } from "lucide-react";
import { T } from "@/lib/config-client";
import { container, btnPrimary, btnSecondary } from "@/lib/ui";

const byId = (id: string) => templates.find((t) => t.id === id) as Template;

function Floating({ id, pos, delay }: { id: string; pos: string; delay: string }) {
  return (
    <div className={`absolute ${pos}`}>
      <div className="animate-floaty overflow-hidden rounded-xl border border-[#E7E7EA] bg-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.25)]" style={{ animationDelay: delay }}>
        <TemplatePreview template={byId(id)} />
      </div>
    </div>
  );
}

export default function Hero() {
  const main = byId("birthday-bloom");
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(70%_55%_at_50%_0%,#F1F1F3,transparent)] pb-16 pt-14 sm:pb-24 sm:pt-20">
      <div className={`${container} text-center`}>
        <Reveal>
          <h1 className="mx-auto max-w-4xl text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <T k="heroTitle">{"Create something they\u2019ll never forget."}</T>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6B6B6B] sm:text-lg">
            <T k="heroSubtitle">{"Turn your memories, wishes, photos and feelings into a beautiful personal website made just for someone special."}</T>
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#templates" className={btnPrimary}>
              <T k="heroPrimary">Explore Templates</T> <ArrowRight size={18} />
            </a>
            <a href="#how-it-works" className={btnSecondary}><T k="heroSecondary">How It Works</T></a>
          </div>
          <p className="mt-6 text-sm text-[#6B6B6B]"><T k="heroTrust">{"Personalized \u2022 Shareable \u2022 Made with memories"}</T></p>
        </Reveal>

        <div className="relative mx-auto mt-14 h-[340px] max-w-5xl sm:mt-16 sm:h-[460px] lg:h-[540px]">
          <Floating id="forever-yours" pos="left-0 top-4 w-[36%] -rotate-3 sm:w-[27%]" delay="0s" />
          <Floating id="midnight-letter" pos="right-0 top-0 w-[34%] rotate-3 sm:w-[27%]" delay="1.2s" />
          <Floating id="best-friends-club" pos="bottom-2 left-[3%] hidden w-[27%] rotate-2 sm:block" delay="2.2s" />
          <Floating id="our-memories" pos="bottom-6 right-[3%] hidden w-[27%] -rotate-2 sm:block" delay="0.6s" />

          <div className="absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 sm:w-[46%]">
            <div className="animate-floaty overflow-hidden rounded-2xl border border-[#E7E7EA] bg-white shadow-[0_40px_80px_-24px_rgba(0,0,0,0.35)]" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-1.5 border-b border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#D9D9DE]" />
                <span className="h-2 w-2 rounded-full bg-[#D9D9DE]" />
                <span className="h-2 w-2 rounded-full bg-[#D9D9DE]" />
                <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-[#6B6B6B]">your-personal-link</span>
              </div>
              <TemplatePreview template={main} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
