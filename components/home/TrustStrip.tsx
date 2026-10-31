"use client";
import { Image as ImageIcon, Link2, QrCode, LayoutTemplate } from "lucide-react";
import { useTemplates } from "@/lib/config-client";
import { container } from "@/lib/ui";

/** Only facts that are true today. No made-up counters. */
export default function TrustStrip() {
  const templates = useTemplates();
  const ready = templates.filter((t) => t.previewUrl).length;
  const items = [
    { Icon: LayoutTemplate, title: `${templates.length} templates to preview`, text: `${ready} ready to publish today.` },
    { Icon: ImageIcon, title: "Your words, your photos", text: "Change names, letters and pictures." },
    { Icon: Link2, title: "A link of your own", text: "Edit the link name before you share." },
    { Icon: QrCode, title: "A printable QR code", text: "Choose colors, frame and text." },
  ];
  return (
    <section className="pb-20 sm:pb-28" aria-label="What you get">
      <div className={container}>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-[#E7E7EA] bg-[#E7E7EA] sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, title, text }) => (
            <li key={title} className="bg-white p-6">
              <Icon size={22} aria-hidden />
              <p className="mt-4 font-semibold tracking-tight">{title}</p>
              <p className="mt-1 text-sm text-[#6B6B6B]">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
