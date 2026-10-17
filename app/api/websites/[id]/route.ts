import { NextResponse } from "next/server";
import { checkSlug } from "@/lib/slug";
import { validateQr } from "@/lib/validate";
import { getOwned, updateMeta } from "@/lib/store";
import { getUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };
const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
const valid = (id: string) => /^[a-f0-9]{16}$/.test(id);

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!valid(id)) return fail(404, "Website not found.");
  const user = await getUser();
  const r = await getOwned(id, { token: req.headers.get("x-edit-token") ?? "", userId: user?.id });
  if ("error" in r) return fail(r.error === "forbidden" ? 403 : 404, r.error === "forbidden" ? "This dashboard is only available on the device that created the website." : "Website not found.");
  return NextResponse.json({ website: r.website });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!valid(id)) return fail(404, "Website not found.");
  let body: { slug?: unknown; qr?: unknown };
  try { body = await req.json(); } catch { return fail(400, "Your request could not be read."); }
  const meta: Parameters<typeof updateMeta>[2] = {};
  if (body.slug !== undefined) {
    const slug = String(body.slug);
    const problem = checkSlug(slug);
    if (problem) return fail(400, problem);
    meta.slug = slug;
  }
  if (body.qr !== undefined) {
    const q = validateQr(body.qr);
    if (!q.ok) return fail(400, q.error);
    meta.qr = q.value;
  }
  try {
    const user = await getUser();
    const r = await updateMeta(id, { token: req.headers.get("x-edit-token") ?? "", userId: user?.id }, meta);
    if ("error" in r) return fail(r.error === "forbidden" ? 403 : r.error === "invalid" ? 409 : 404, r.error === "invalid" ? r.message ?? "Invalid change." : "We couldn't update this website.");
    return NextResponse.json({ website: r.website });
  } catch {
    return fail(500, "Could not save your changes. Please try again.");
  }
}
