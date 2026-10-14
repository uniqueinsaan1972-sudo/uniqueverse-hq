import QRCode from "qrcode";
import type { QrSettings } from "@/types/website";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Returns a warning when the color pair may be hard to scan, otherwise null. */
export function contrastWarning(fg: string, bg: string): string | null {
  const [a, b] = [lum(fg), lum(bg)];
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  if (a > b) return "The QR is lighter than its background. Many scanners can't read this. Use a dark QR on a light background.";
  if (ratio < 4) return "These colors are too close together. The QR may be hard to scan.";
  return null;
}

const PAD: Record<QrSettings["frame"], number> = { none: 0, minimal: 24, rounded: 30, elegant: 36, modern: 34, celebration: 36 };

/** Builds a self-contained SVG (also used for PNG export). Decoration never touches the QR or its quiet zone. */
export function buildQrSvg(url: string, q: QrSettings): string {
  const code = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = code.modules.size, m = 10, quiet = 4 * m;
  const dark = (r: number, c: number) => r >= 0 && c >= 0 && r < n && c < n && Boolean(code.modules.get(r, c));
  const box = n * m + 2 * quiet, F = PAD[q.frame];
  const line1 = q.showText ? q.text.trim() : "", line2 = q.showText ? q.caption.trim() : "";
  const textH = (line1 ? 58 : 0) + (line2 ? 42 : 0) + (line1 || line2 ? 14 : 0);
  const W = box + 2 * F, H = box + 2 * F + textH;
  const { foreground: fg, background: bg } = q;
  const inFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  let mods = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!dark(r, c)) continue;
    if (q.style === "soft" && inFinder(r, c)) continue;
    const x = F + quiet + c * m, y = F + quiet + r * m;
    if (q.style === "dots" || q.style === "soft") mods += `<circle cx="${x + m / 2}" cy="${y + m / 2}" r="${m * 0.46}"/>`;
    else if (q.style === "rounded") mods += `<rect x="${x}" y="${y}" width="${m}" height="${m}" rx="${m * 0.3}"/>`;
    else mods += `<rect x="${x}" y="${y}" width="${m + 0.4}" height="${m + 0.4}"/>`;
  }
  if (q.style === "soft") {
    for (const [r, c] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      const x = F + quiet + c * m, y = F + quiet + r * m;
      mods += `<rect x="${x}" y="${y}" width="${7 * m}" height="${7 * m}" rx="${2 * m}"/><rect x="${x + m}" y="${y + m}" width="${5 * m}" height="${5 * m}" rx="${1.4 * m}" fill="${bg}"/><rect x="${x + 2 * m}" y="${y + 2 * m}" width="${3 * m}" height="${3 * m}" rx="${m}"/>`;
    }
  }

  let frame = "";
  if (q.frame === "minimal") frame = `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="${fg}" stroke-width="3"/>`;
  if (q.frame === "rounded") frame = `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="28" fill="none" stroke="${fg}" stroke-width="6"/>`;
  if (q.frame === "elegant") frame = `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="${fg}" stroke-width="2"/><rect x="17" y="17" width="${W - 34}" height="${H - 34}" fill="none" stroke="${fg}" stroke-width="1"/>`;
  if (q.frame === "modern") frame = `<rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${fg}"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="6" fill="${bg}"/>`;
  if (q.frame === "celebration") {
    const dots = [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18], [W / 2, 14], [W / 2, H - 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6"/>`).join("");
    frame = `<rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="24" fill="none" stroke="${fg}" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/><g fill="${fg}">${dots}</g>`;
  }

  const x = q.align === "left" ? F + quiet : q.align === "right" ? W - F - quiet : W / 2;
  const anchor = q.align === "left" ? "start" : q.align === "right" ? "end" : "middle";
  let ty = box + 2 * F - F + 38;
  let text = "";
  if (line1) { text += `<text x="${x}" y="${ty}" text-anchor="${anchor}" font-size="34" font-weight="700">${esc(line1)}</text>`; ty += 42; }
  if (line2) text += `<text x="${x}" y="${ty}" text-anchor="${anchor}" font-size="22" opacity="0.8">${esc(line2)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${frame}<g fill="${fg}"${q.style === "classic" ? ' shape-rendering="crispEdges"' : ""}>${mods}</g><g fill="${fg}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">${text}</g></svg>`;
}

export async function svgToPngBlob(svg: string, width = 2400): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((ok, bad) => { img.onload = () => ok(); img.onerror = () => bad(new Error("render")); img.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = Math.round((width * img.naturalHeight) / img.naturalWidth);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((ok, bad) => canvas.toBlob((b) => (b ? ok(b) : bad(new Error("png"))), "image/png"));
  } finally { URL.revokeObjectURL(url); }
}

export function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
