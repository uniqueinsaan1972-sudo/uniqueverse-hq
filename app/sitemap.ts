import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { templates } from "@/data/templates";

const pages = ["", "/templates", "/about", "/contact", "/faq", "/privacy", "/terms", "/cookies", "/disclaimer"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = "2026-10-13";
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.6 })),
    ...templates.map((t) => ({ url: `${SITE_URL}/templates/${t.id}`, lastModified, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
