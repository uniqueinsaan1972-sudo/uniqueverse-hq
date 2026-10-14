import { MousePointerClick, PenLine, Sparkles, Share2 } from "lucide-react";
import Reveal from "./Reveal";
import { container } from "@/lib/ui";

const steps = [
  { n: "01", title: "Choose", text: "Pick a beautiful template.", Icon: MousePointerClick },
  { n: "02", title: "Personalize", text: "Add their name, your message, photos and memories.", Icon: PenLine },
  { n: "03", title: "Create", text: "UniqueVerse turns your details into a personal experience.", Icon: Sparkles },
  { n: "04", title: "Share", text: "Get your private link and QR code and send it to them.", Icon: Share2 },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="pb-20 sm:pb-28">
      <div className={container}>
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">How UniqueVerse works</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#6B6B6B] sm:text-lg">From a template to a personal link in four simple steps.</p>
        </Reveal>
        <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-[#E7E7EA] lg:block" />
          {steps.map(({ n, title, text, Icon }, i) => (
            <Reveal key={n} delay={i * 0.08} className="relative text-center">
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#E7E7EA] bg-white shadow-sm">
                <Icon size={22} />
              </div>
              <p className="mt-5 text-sm font-semibold text-[#6B6B6B]">{n}</p>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#6B6B6B]">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
