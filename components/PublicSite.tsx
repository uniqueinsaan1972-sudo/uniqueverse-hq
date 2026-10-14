"use client";
import type { TemplateContent } from "@/types/content";
import { getTemplateById } from "@/data/templates";
import { getContentConfig } from "@/data/templateContent";
import TemplateFrame from "./TemplateFrame";

/** The finished website: just the template with the owner's content. No editing controls. */
export default function PublicSite({ templateId, content }: { templateId: string; content: TemplateContent }) {
  const template = getTemplateById(templateId);
  if (!template?.previewUrl) return null;
  return (
    <TemplateFrame src={template.previewUrl} title={`${template.name}`} content={content} nameSlots={getContentConfig(template).nameSlots} className="fixed inset-0 h-dvh w-screen border-0" />
  );
}
