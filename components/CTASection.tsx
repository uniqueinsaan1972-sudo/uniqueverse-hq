import Reveal from "./Reveal";
import { T } from "@/lib/config-client";
import { container } from "@/lib/ui";

export default function CTASection() {
  return (
    <section className="pb-20 sm:pb-28">
      <div className={container}>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#111111] px-6 py-16 text-center text-white sm:px-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.14),transparent)]" />
          <Reveal className="relative">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              <T k="ctaTitle">Your story. Their moment. One unforgettable experience.</T>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-white/70 sm:text-lg">
              <T k="ctaSubtitle">Choose a template and start creating something uniquely yours.</T>
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#templates" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-[15px] font-semibold text-[#111111] transition hover:bg-white/90">
                Explore Templates
              </a>
              <a href="#templates" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-[15px] font-semibold text-white transition hover:border-white">
                Create Your First Experience
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
