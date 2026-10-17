import { NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates";
import { getContentConfig } from "@/data/templateContent";
import { validateContent } from "@/lib/validate";
import { createWebsite, updateContent } from "@/lib/store";
import { adminDb } from "@/lib/supabase";
import { allow, clientIp } from "@/lib/ratelimit";
import { getUser } from "@/lib/auth";
import { balanceOf, spend, grant, templatePrice } from "@/lib/tokens";

const fail = (status: number, error: string, code?: string, extra?: object) => NextResponse.json({ error, code, ...extra }, { status });

async function logGenerate(templateId: string, ok: boolean) {
  try { await adminDb().from("events").insert({ kind: "generate", template_id: templateId, ok }); } catch { /* never block the user */ }
}

/**
 * Create a website (needs a signed-in account and costs the template's tokens, unless it is free),
 * or save changes to an existing one (free; needs the edit key or the owning account).
 */
export async function POST(req: Request) {
  let body: { templateId?: string; content?: unknown; websiteId?: string; token?: string };
  try { body = await req.json(); } catch { return fail(400, "Your request could not be read. Please try again."); }

  const template = typeof body.templateId === "string" ? getTemplateById(body.templateId) : undefined;
  if (!template || !template.previewUrl) return fail(400, "This template can't be published yet.");
  if (!(await allow(`gen:${clientIp(req)}`, 20, 3600))) return fail(429, "You are going too fast. Please try again in a little while.");
  const config = getContentConfig(template);
  const v = validateContent(body.content, config);
  if (!v.ok) return fail(400, v.error, "invalid");
  const user = await getUser();

  try {
    if (body.websiteId) {
      const r = await updateContent(String(body.websiteId), { token: String(body.token ?? ""), userId: user?.id }, v.value);
      if ("error" in r) return fail(r.error === "forbidden" ? 403 : 404, "We couldn't find the website you're updating.", r.error);
      await logGenerate(template.id, true);
      return NextResponse.json({ website: r.website });
    }

    if (!user) return fail(401, "Please sign in or create a free account to generate your website.", "login");
    const off = await adminDb().from("template_overrides").select("hidden,deleted").eq("template_id", template.id).maybeSingle();
    if (off.data?.hidden || off.data?.deleted) return fail(403, "This template is not available right now.");

    const price = await templatePrice(template.id);
    if (price > 0 && !(await spend(user.id, price, "generate", template.id))) {
      const balance = await balanceOf(user.id);
      return fail(402, `You need ${price} tokens to generate this website. You have ${balance}.`, "tokens", { needed: price, balance });
    }
    try {
      const name = v.value.names.main || template.name;
      const created = await createWebsite(template.id, v.value, `${name} ${template.name}`, name ? `Open ${name}'s ${template.name}` : "", user.id);
      await logGenerate(template.id, true);
      return NextResponse.json(created, { status: 201 });
    } catch (e) {
      if (price > 0) { try { await grant(user.id, price, "refund", template.id); } catch { /* logged below */ } }
      throw e;
    }
  } catch (e) {
    console.error("Generate failed:", e instanceof Error ? e.message : "unknown error");
    await logGenerate(template.id, false);
    return fail(500, "Your website could not be generated. Your customization is safe and any tokens were returned. Try again.");
  }
}
