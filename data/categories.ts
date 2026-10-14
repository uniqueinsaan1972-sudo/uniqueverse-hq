import type { Category } from "@/types/template";

export const categories: Category[] = [
  { id: "birthday", label: "Birthday" },
  { id: "love", label: "Love" },
  { id: "friendship", label: "Friendship" },
  { id: "anniversary", label: "Anniversary" },
  { id: "wedding", label: "Wedding" },
  { id: "congratulations", label: "Congratulations" },
  { id: "memories", label: "Memories" },
  { id: "letters", label: "Letters" },
  { id: "festivals", label: "Eid & Festivals" },
];

/** Pills shown on the marketplace page (after "All"). */
export const marketplaceCategories: { id: string; label: string }[] = [
  ...categories,
  { id: "custom", label: "Custom" },
];
