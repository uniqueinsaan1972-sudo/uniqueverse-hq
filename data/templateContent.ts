import type { Template } from "@/types/template";
import type { ContentConfig, ImageValue } from "@/types/content";

const folder = "/template-files/birthday-surprise/";
const img = (path: string): ImageValue => ({ src: folder + path, name: path.split("/").pop() ?? path, isDefault: true });

/** One entry per real template. The values here are the single source of truth for its demo content. */
const registry: Record<string, ContentConfig> = {
  "birthday-surprise": {
    defaults: {
      names: {
        main: "Alina",
        nickname: "Ali",
        sender: "Your Friend",
        useEverywhere: true,
        slots: { hero: "Alina", letter: "Alina", finale: "Alina" },
      },
      wish:
        "To the most wonderful girl in my life. Thank you for always being my source of encouragement, my strong support, and the joy in my life. I wish you to always be beautiful, happy, and successful in everything. I love you very much! 💕",
      image: null,
      gallery: [img("image.jpg"), img("image/photo_roses.jpg"), img("flower.jpg"), img("image/photo_cake.jpg")],
    },
    nameSlots: [
      { id: "hero", label: "Ribbon text" },
      { id: "letter", label: "Letter heading" },
      { id: "finale", label: "Finale heading" },
    ],
    fields: { names: true, nickname: false, sender: false, wish: true, image: false, gallery: true },
    wishLabel: "Birthday letter",
    gallery: { min: 4, max: 4 },
  },
};

/** Older templates without their own entry still work: name + message, taken from their preview. */
function fallbackConfig(t: Template): ContentConfig {
  const m = t.previewTitle.match(/,\s*([A-Z][^!?.]*?)\s*$/);
  const main = m ? m[1] : "Alina";
  return {
    defaults: {
      names: { main, nickname: "", sender: "", useEverywhere: true, slots: { title: main } },
      wish: t.previewSubtitle,
      image: null,
      gallery: [],
    },
    nameSlots: [{ id: "title", label: "Heading" }],
    fields: { names: Boolean(m), nickname: false, sender: false, wish: true, image: false, gallery: false },
    wishLabel: "Message",
  };
}

export const getContentConfig = (t: Template): ContentConfig => registry[t.id] ?? fallbackConfig(t);
