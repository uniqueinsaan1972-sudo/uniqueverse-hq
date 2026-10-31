import { MousePointerClick, PenLine, Share2 } from "lucide-react";
import Reveal from "./Reveal";
import { container } from "@/lib/ui";

const steps = [
  { n: "01", title: "Choose a template", text: "Pick the design that fits the moment.", Icon: MousePointerClick },
  { n: "02", title: "Personalize the content", text: "Add the name, your letter and your photos.", Icon: PenLine },
  { n: "03", title: "Publish and share", text: "Get a personal link and a QR code.", Icon: Share2 },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="pb-20 sm:pb-28" aria-labelledby="how-title">
      <div className={container}>
        <Reveal className="text-center">
          <h2 id="how-title" className="text-3xl font-semibold tracking-tight sm:text-5xl">How it works</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#6B6B6B] sm:text-lg">Three simple steps, from idea to a link you can send.</p>
        </Reveal>
        <ol className="relative mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
          <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-px bg-[#E7E7EA] sm:block" />
          {steps.map(({ n, title, text, Icon }, i) => (
            <Reveal key={n} delay={i * 0.08} className="relative text-center">
              <li className="list-none">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#E7E7EA] bg-white shadow-sm"><Icon size={22} /></div>
                <p className="mt-5 text-sm font-semibold text-[#6B6B6B]">{n}</p>
                <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#6B6B6B]">{text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
