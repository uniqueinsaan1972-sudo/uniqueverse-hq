import type { Template } from "@/types/template";

function isLight(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

const dots = [
  { l: "12%", t: "26%", s: 2.4 }, { l: "80%", t: "20%", s: 1.6 },
  { l: "22%", t: "74%", s: 1.8 }, { l: "88%", t: "66%", s: 2.6 },
  { l: "60%", t: "14%", s: 1.4 }, { l: "8%", t: "52%", s: 1.2 },
];

/** Renders a template as a miniature website. Everything scales with the card width (cqw). */
export default function TemplatePreview({
  template,
  className = "aspect-[4/3]",
}: {
  template: Template;
  className?: string;
}) {
  // Real templates (with their own folder) show their preview.jpg instead of the themed mini-preview.
  if (template.previewUrl) {
    const image = template.previewUrl.replace(/[^/]*$/, "") + "preview.jpg";
    return (
      <div className={`relative w-full overflow-hidden bg-[#F7F7F8] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${template.name} preview`} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }
  const { theme } = template;
  const btnText = isLight(theme.accent) ? "#111111" : "#ffffff";
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ background: theme.background, color: theme.text, containerType: "inline-size" }}
    >
      {/* mood decoration */}
      {theme.mood === "elegant" && (
        <div className="absolute" style={{ inset: "4cqw", border: `1px solid ${theme.accent}`, opacity: 0.45 }} />
      )}
      {theme.mood === "soft" && (
        <>
          <div className="absolute rounded-full" style={{ width: "50cqw", height: "50cqw", left: "-14cqw", top: "-18cqw", background: theme.accent, opacity: 0.16 }} />
          <div className="absolute rounded-full" style={{ width: "40cqw", height: "40cqw", right: "-12cqw", bottom: "-14cqw", background: theme.accent, opacity: 0.14 }} />
        </>
      )}
      {theme.mood === "cinematic" && (
        <>
          <div className="absolute rounded-full" style={{ width: "70cqw", height: "70cqw", left: "15cqw", top: "-30cqw", background: theme.accent, opacity: 0.18, filter: "blur(30px)" }} />
          {dots.map((d, i) => (
            <span key={i} className="absolute rounded-full" style={{ left: d.l, top: d.t, width: `${d.s}cqw`, height: `${d.s}cqw`, background: theme.text, opacity: 0.6 }} />
          ))}
        </>
      )}
      {(theme.mood === "playful" || theme.mood === "festive") &&
        dots.map((d, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: d.l, top: d.t, width: `${d.s * 1.6}cqw`, height: `${d.s * 1.6}cqw`,
              background: theme.accent, opacity: 0.55,
              borderRadius: i % 2 ? "50%" : "20%", transform: `rotate(${i * 25}deg)`,
            }}
          />
        ))}

      {/* tiny nav */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between" style={{ padding: "3.5cqw 5cqw" }}>
        <span style={{ fontSize: "2.8cqw", fontWeight: 700, opacity: 0.8 }}>✦ for you</span>
        <span className="flex" style={{ gap: "1.4cqw" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="rounded-full" style={{ width: "1.6cqw", height: "1.6cqw", background: theme.text, opacity: 0.35 }} />
          ))}
        </span>
      </div>

      {/* polaroid */}
      <div
        className="absolute"
        style={{
          right: "8cqw", bottom: "9cqw", width: "15cqw", height: "18cqw", rotate: "8deg",
          background: "rgba(255,255,255,0.7)", border: `1px solid ${theme.accent}55`,
          borderRadius: "1.2cqw", padding: "1.2cqw", boxShadow: "0 1cqw 3cqw rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ width: "100%", height: "80%", background: theme.accent, opacity: 0.5, borderRadius: "0.6cqw" }} />
      </div>

      {/* content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "0 12cqw", gap: "2cqw" }}>
        <h3 style={{ fontSize: "7.4cqw", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {template.previewTitle}
        </h3>
        <p style={{ fontSize: "3.3cqw", opacity: 0.75, lineHeight: 1.35 }}>{template.previewSubtitle}</p>
        <span
          style={{
            marginTop: "1.5cqw", fontSize: "3cqw", fontWeight: 600, padding: "1.8cqw 4.6cqw",
            borderRadius: "999px", background: theme.accent, color: btnText,
          }}
        >
          Open your surprise
        </span>
      </div>
    </div>
  );
}
