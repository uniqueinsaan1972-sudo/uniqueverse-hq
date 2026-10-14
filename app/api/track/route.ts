import { adminDb } from "@/lib/supabase";
import { allow, clientIp } from "@/lib/ratelimit";

const KINDS = new Set(["page_view", "template_view", "customize_start"]);

export async function POST(req: Request) {
  const done = () => new Response(null, { status: 204 });
  try {
    const b = (await req.json()) as { kind?: string; path?: string; templateId?: string; visitor?: string };
    if (!b.kind || !KINDS.has(b.kind) || typeof b.path !== "string" || !/^\/[A-Za-z0-9\-_/]{0,100}$/.test(b.path)) return done();
    if (b.path.startsWith("/admin") || b.path.startsWith("/api")) return done();
    if (!(await allow(`track:${clientIp(req)}`, 120, 60))) return done();
    const path = b.path.startsWith("/birthday/") ? "/birthday/*" : b.path.startsWith("/website/") ? "/website/*" : b.path;
    const template = typeof b.templateId === "string" && /^[a-z0-9-]{1,60}$/.test(b.templateId) ? b.templateId : null;
    await adminDb().from("events").insert({
      kind: b.kind, path, template_id: b.kind === "page_view" ? null : template,
      visitor: typeof b.visitor === "string" && /^[a-f0-9]{16,32}$/.test(b.visitor) ? b.visitor : null,
    });
  } catch { /* analytics must never break the site */ }
  return done();
}
