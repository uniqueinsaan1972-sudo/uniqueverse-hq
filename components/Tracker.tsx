"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

function visitorId() {
  try {
    let v = localStorage.getItem("uv:vid");
    if (!v) { v = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem("uv:vid", v); }
    return v;
  } catch { return ""; }
}

/** Anonymous page-view counting: path + a random id kept in this browser. No names, messages or photos. */
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin") || path.startsWith("/api")) return;
    const send = (kind: string, templateId?: string) =>
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ kind, path, templateId, visitor: visitorId() }) }).catch(() => undefined);
    send("page_view");
    const m = path.match(/^\/(templates|customize)\/([a-z0-9-]+)$/);
    if (m) send(m[1] === "templates" ? "template_view" : "customize_start", m[2]);
  }, [path]);
  return null;
}
