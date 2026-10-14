"use client";
import { useCallback, useEffect, useRef } from "react";
import type { NameSlot, TemplateContent } from "@/types/content";
import { resolveNames } from "@/lib/content";

/** Shows a real template in an iframe and streams the current content into it. */
export default function TemplateFrame({
  src, title, content, nameSlots, className,
}: {
  src: string; title: string; content: TemplateContent; nameSlots: NameSlot[]; className?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const send = useCallback(() => {
    ref.current?.contentWindow?.postMessage(
      { type: "uv:content", content, names: resolveNames(content, nameSlots) },
      window.location.origin,
    );
  }, [content, nameSlots]);
  useEffect(() => { send(); }, [send]);
  return <iframe ref={ref} src={src} title={title} onLoad={send} className={className} />;
}
