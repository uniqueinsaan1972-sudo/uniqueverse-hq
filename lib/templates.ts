import type { Template } from "@/types/template";
import { marketplaceCategories } from "@/data/categories";

export function categoryLabel(id: string) {
  return marketplaceCategories.find((c) => c.id === id)?.label ?? id.charAt(0).toUpperCase() + id.slice(1);
}

/** Search (name, category, description) and category filter work together. */
export function filterTemplates(list: Template[], query: string, category: string) {
  const q = query.trim().toLowerCase();
  return list.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (!q) return true;
    return [t.name, categoryLabel(t.category), t.description, t.previewTitle].some((s) => s.toLowerCase().includes(q));
  });
}
