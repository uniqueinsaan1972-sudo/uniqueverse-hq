import type { ContentConfig, ImageValue, TemplateContent } from "@/types/content";
import { QR_ALIGNS, QR_FRAMES, QR_STYLES, defaultQr, type QrSettings } from "@/types/website";

type R<T> = { ok: true; value: T } | { ok: false; error: string };
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export const DATA_URL = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const SAFE_PATH = /^\/(template-files\/[a-z0-9-]+\/[A-Za-z0-9_./-]+|api\/media\/[a-z0-9-]+\/[a-z0-9.-]+)$/;
const MAX_DATA_URL = 7_000_000;

function image(raw: unknown): ImageValue | null | "bad" {
  if (raw === null || raw === undefined) return null;
  if (!isObj(raw) || typeof raw.src !== "string") return "bad";
  const src = raw.src;
  const okSrc = (DATA_URL.test(src) && src.length <= MAX_DATA_URL) || (SAFE_PATH.test(src) && !src.includes(".."));
  if (!okSrc) return "bad";
  return { src, name: str(raw.name, 120) || "image", size: typeof raw.size === "number" ? raw.size : undefined, isDefault: raw.isDefault === true };
}

export function validateContent(raw: unknown, config: ContentConfig): R<TemplateContent> {
  if (!isObj(raw) || !isObj(raw.names)) return { ok: false, error: "Some of your details are missing." };
  const n = raw.names;
  const main = str(n.main, 60).trim();
  if (config.fields.names && !main) return { ok: false, error: "Please enter a main name." };
  const slotsIn = isObj(n.slots) ? n.slots : {};
  const slots = Object.fromEntries(config.nameSlots.map((s) => [s.id, str(slotsIn[s.id], 60) || main]));
  const wish = str(raw.wish, 2000);
  if (config.fields.wish && !wish.trim()) return { ok: false, error: "Please write a message." };

  const main_img = image(raw.image);
  if (main_img === "bad") return { ok: false, error: "The main image is not valid." };
  const galleryIn = Array.isArray(raw.gallery) ? raw.gallery : [];
  const max = config.gallery?.max ?? 12;
  if (galleryIn.length > max) return { ok: false, error: `You can use at most ${max} gallery images.` };
  if (galleryIn.length < (config.gallery?.min ?? 0)) return { ok: false, error: "Some gallery images are missing." };
  const gallery: ImageValue[] = [];
  for (const g of galleryIn) {
    const v = image(g);
    if (!v || v === "bad") return { ok: false, error: "One of the gallery images is not valid or is too large." };
    gallery.push(v);
  }
  return {
    ok: true,
    value: {
      names: { main, nickname: str(n.nickname, 60), sender: str(n.sender, 60), useEverywhere: n.useEverywhere !== false, slots },
      wish, image: main_img, gallery,
    },
  };
}

const HEX = /^#[0-9a-fA-F]{6}$/;
export function validateQr(raw: unknown): R<QrSettings> {
  if (!isObj(raw)) return { ok: false, error: "QR settings are missing." };
  const pick = <T extends string>(v: unknown, list: readonly T[], d: T): T => (list.includes(v as T) ? (v as T) : d);
  if (!HEX.test(String(raw.foreground)) || !HEX.test(String(raw.background))) return { ok: false, error: "QR colors must be valid hex colors." };
  return {
    ok: true,
    value: {
      style: pick(raw.style, QR_STYLES, defaultQr.style),
      frame: pick(raw.frame, QR_FRAMES, defaultQr.frame),
      align: pick(raw.align, QR_ALIGNS, defaultQr.align),
      foreground: String(raw.foreground), background: String(raw.background),
      showText: raw.showText !== false, text: str(raw.text, 40), caption: str(raw.caption, 70),
    },
  };
}
