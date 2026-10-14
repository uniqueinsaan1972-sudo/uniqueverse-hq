import type { TemplateContent } from "./content";

export const QR_STYLES = ["classic", "rounded", "dots", "soft"] as const;
export const QR_FRAMES = ["none", "minimal", "rounded", "elegant", "modern", "celebration"] as const;
export const QR_ALIGNS = ["left", "center", "right"] as const;

export interface QrSettings {
  style: (typeof QR_STYLES)[number];
  foreground: string;
  background: string;
  frame: (typeof QR_FRAMES)[number];
  showText: boolean;
  text: string;
  align: (typeof QR_ALIGNS)[number];
  caption: string;
}

export const defaultQr: QrSettings = {
  style: "rounded", foreground: "#111111", background: "#ffffff", frame: "rounded",
  showText: true, text: "Scan Me ❤️", align: "center", caption: "",
};

/** What the owner sees (the secret edit token never leaves the server except once, at creation). */
export interface GeneratedWebsite {
  id: string;
  templateId: string;
  slug: string;
  status: "published";
  createdAt: string;
  updatedAt: string;
  data: TemplateContent;
  qr: QrSettings;
}
