"use client";
import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import type { Template } from "@/types/template";
import TemplatePreview from "./TemplatePreview";
import TemplateFrame from "./TemplateFrame";
import { getContentConfig } from "@/data/templateContent";
import { useTemplates } from "@/lib/config-client";

type Mode = "desktop" | "mobile";

/** Shows the template large, with a desktop / mobile switch.
 *  If a template defines `previewUrl` (its real built page) it is shown in an iframe,
 *  otherwise the themed preview is rendered. */
export default function PreviewStage({ template }: { template: Template }) {
  const [mode, setMode] = useState<Mode>("desktop");
  const config = getContentConfig(template);
  const available = useTemplates().some((t) => t.id === template.id);
  const modes: { id: Mode; label: string; Icon: typeof Monitor }[] = [
    { id: "desktop", label: "Desktop", Icon: Monitor },
    { id: "mobile", label: "Mobile", Icon: Smartphone },
  ];
  if (!available) {
    return (
      <div className="rounded-2xl border border-[#E7E7EA] bg-[#F7F7F8] p-10 text-center">
        <h2 className="text-xl font-semibold">This template is not available right now</h2>
        <p className="mt-2 text-sm text-[#6B6B6B]">It may have been hidden or removed. Please choose another template.</p>
      </div>
    );
  }
  return (
    <div>
      <div role="group" aria-label="Preview size" className="mx-auto flex w-fit rounded-full border border-[#E7E7EA] bg-white p-1">
        {modes.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition ${
              mode === id ? "bg-[#111111] text-white" : "text-[#6B6B6B] hover:text-[#111111]"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className={`mx-auto mt-6 w-full transition-all duration-500 ${mode === "desktop" ? "max-w-5xl" : "max-w-[360px]"}`}>
        <div className="overflow-hidden rounded-2xl border border-[#E7E7EA] bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-1.5 border-b border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
            <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-[#6B6B6B]">your-personal-link</span>
          </div>
          {template.previewUrl ? (
            <TemplateFrame
              src={template.previewUrl}
              title={`${template.name} preview`}
              content={config.defaults}
              nameSlots={config.nameSlots}
              className={`w-full border-0 ${mode === "desktop" ? "h-[70vh]" : "h-[640px]"}`}
            />
          ) : (
            <TemplatePreview template={template} className={mode === "desktop" ? "aspect-[16/10]" : "aspect-[9/16]"} />
          )}
        </div>
      </div>
    </div>
  );
}
