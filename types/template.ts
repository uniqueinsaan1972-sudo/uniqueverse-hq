export type CategoryId =
  | "birthday" | "love" | "friendship" | "anniversary" | "wedding"
  | "congratulations" | "memories" | "letters" | "festivals";

export interface Category {
  id: CategoryId;
  label: string;
}

/** Each template carries its own look, so the homepage can render
 *  realistic mini-previews now and the real template later. */
export interface TemplateTheme {
  background: string; // CSS color or gradient
  accent: string;
  text: string;
  mood: "soft" | "playful" | "cinematic" | "elegant" | "festive";
}

export interface Template {
  id: string;              // used later for /templates/[id] and /create/[id]
  name: string;
  category: CategoryId;
  description: string;
  theme: TemplateTheme;
  previewTitle: string;    // text shown inside the mini preview
  previewSubtitle: string;
  previewImage?: string;
  previewUrl?: string;
  featured?: boolean;
}
