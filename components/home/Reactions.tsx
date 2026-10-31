import { reactions } from "@/data/reactions";
import Reveal from "@/components/Reveal";
import { container } from "@/lib/ui";

export default function Reactions() {
  return (
    <section className="pb-20 sm:pb-28" aria-labelledby="reactions-title">
      <div className={container}>
        <Reveal className="text-center">
          <h2 id="reactions-title" className="text-3xl font-semibold tracking-tight sm:text-5xl">Little Websites. Big Feelings.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#6B6B6B] sm:text-lg">The kind of reaction a personal website can bring.</p>
          {!reactions.verified && (
            <p className="mx-auto mt-3 inline-block rounded-full border border-[#E7E7EA] px-3 py-1 text-xs font-medium text-[#6B6B6B]">
              Example reactions. These are illustrations, not real customer reviews.
            </p>
          )}
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reactions.items.map((text, i) => (
            <Reveal key={text} delay={i * 0.06}>
              <figure className="h-full rounded-2xl border border-[#E7E7EA] bg-white p-6 shadow-sm">
                <blockquote className="text-lg font-medium leading-snug tracking-tight text-[#111111]">&ldquo;{text}&rdquo;</blockquote>
                {!reactions.verified && <figcaption className="mt-4 text-xs text-[#6B6B6B]">Sample message</figcaption>}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
