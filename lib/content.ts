import type { ImageValue, NameSlot, TemplateContent } from "@/types/content";

export const cloneContent = (c: TemplateContent): TemplateContent => JSON.parse(JSON.stringify(c));

/** The name shown in one place of the template. */
export function slotName(c: TemplateContent, slotId: string) {
  const n = c.names;
  return (n.useEverywhere ? n.main : n.slots[slotId] ?? n.main) || n.main;
}

export function resolveNames(c: TemplateContent, slots: NameSlot[]) {
  return Object.fromEntries(slots.map((s) => [s.id, slotName(c, s.id)]));
}

export function formatBytes(b?: number) {
  if (!b) return "";
  return b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function fileLabel(img: ImageValue) {
  const ext = img.name.split(".").pop()?.toUpperCase() ?? "IMG";
  return [ext, img.isDefault ? "Template default" : formatBytes(img.size)].filter(Boolean).join(" • ");
}

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // before compression
const MAX_SIDE = 1600;
const QUALITY = 0.82;

const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read this file."));
    r.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This image could not be opened."));
    img.src = src;
  });

/**
 * Reads an image and shrinks it before it is stored or uploaded: max 1600 px on the long side,
 * JPEG (or WebP for PNGs) at 82% quality. Animated GIFs are kept as they are.
 */
export async function fileToImage(file: File): Promise<ImageValue> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is too large (max 15 MB).");
  const original = await readDataUrl(file);
  if (file.type === "image/gif") {
    if (file.size > 5 * 1024 * 1024) throw new Error("GIFs can be at most 5 MB.");
    return { src: original, name: file.name, size: file.size, type: file.type };
  }
  const img = await loadImage(original);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this image.");
  const type = file.type === "image/png" ? "image/webp" : "image/jpeg";
  if (type === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(img, 0, 0, w, h);
  let out = canvas.toDataURL(type, QUALITY);
  if (!out.startsWith(`data:${type}`)) out = canvas.toDataURL("image/jpeg", QUALITY); // browser lacks WebP
  // never make a small, already-light image bigger
  const useOriginal = scale === 1 && out.length > original.length && file.size < 600 * 1024 && /^data:image\/(png|jpeg|webp)/.test(original);
  const src = useOriginal ? original : out;
  const ext = src.startsWith("data:image/webp") ? "webp" : src.startsWith("data:image/jpeg") ? "jpg" : file.name.split(".").pop() ?? "png";
  return {
    src,
    name: useOriginal ? file.name : `${file.name.replace(/\.[^.]+$/, "")}.${ext}`,
    size: Math.round(((src.length - src.indexOf(",") - 1) * 3) / 4),
    type: src.slice(5, src.indexOf(";")),
  };
}
