import { NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates";
import { getContentConfig } from "@/data/templateContent";
import { validateContent } from "@/lib/validate";
import { createWebsite, updateContent } from "@/lib/store";
import { adminDb } from "@/lib/supabase";
import { allow, clientIp } from "@/lib/ratelimit";

const fail = (status: number, error: string, code?: string) => NextResponse.json({ error, code }, { status });

async function logGenerate(templateId: string, ok: boolean) {
  try { await adminDb().from("events").insert({ kind: "generate", template_id: templateId, ok }); } catch { /* never block the user */ }
}

/** Create a website, or update the content of an existing one (when websiteId + token are sent). */
export async function POST(req: Request) {
  let body: { templateId?: string; content?: unknown; websiteId?: string; token?: string };
  try { body = await req.json(); } catch { return fail(400, "Your request could not be read. Please try again."); }

  const template = typeof body.templateId === "string" ? getTemplateById(body.templateId) : undefined;
  if (!template || !template.previewUrl) return fail(400, "This template can't be published yet.");
  if (!(await allow(`gen:${clientIp(req)}`, 20, 3600))) return fail(429, "You are going too fast. Please try again in a little while.");
  const config = getContentConfig(template);
  const v = validateContent(body.content, config);
  if (!v.ok) return fail(400, v.error, "invalid");

  try {
    if (body.websiteId) {
      const r = await updateContent(String(body.websiteId), String(body.token ?? ""), v.value);
      if ("error" in r) return fail(r.error === "forbidden" ? 403 : 404, "We couldn't find the website you're updating.", r.error);
      await logGenerate(template.id, true);
      return NextResponse.json({ website: r.website });
    }
    const off = await adminDb().from("template_overrides").select("hidden,deleted").eq("template_id", template.id).maybeSingle();
    if (off.data?.hidden || off.data?.deleted) return fail(403, "This template is not available right now.");
    const name = v.value.names.main || template.name;
    const created = await createWebsite(template.id, v.value, `${name} ${template.name}`, name ? `Open ${name}'s ${template.name}` : "");
    await logGenerate(template.id, true);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("Generate failed:", e instanceof Error ? e.message : "unknown error");
    await logGenerate(template.id, false);
    return fail(500, "Your website could not be generated. Your customization is safe. Try again.");
  }
}
