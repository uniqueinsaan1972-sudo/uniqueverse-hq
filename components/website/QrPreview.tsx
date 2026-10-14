"use client";
import { useMemo } from "react";
import type { QrSettings } from "@/types/website";
import { buildQrSvg } from "@/lib/qr";

export default function QrPreview({ url, qr, className = "" }: { url: string; qr: QrSettings; className?: string }) {
  const result = useMemo(() => {
    if (!url) return { svg: "" };
    try { return { svg: buildQrSvg(url, qr) }; } catch { return { error: true as const }; }
  }, [url, qr]);
  if ("error" in result) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">The QR code could not be generated. Please try again.</p>;
  if (!result.svg) return <div className={`aspect-square animate-pulse rounded-2xl bg-[#F7F7F8] ${className}`} />;
  return <div className={`[&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${className}`} aria-label="QR code preview" dangerouslySetInnerHTML={{ __html: result.svg }} />;
}
