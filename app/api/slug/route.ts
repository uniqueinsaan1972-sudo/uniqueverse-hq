import { NextResponse } from "next/server";
import { checkSlug } from "@/lib/slug";
import { slugAvailable } from "@/lib/store";
import { allow, clientIp } from "@/lib/ratelimit";

export async function GET(req: Request) {
  if (!(await allow(`slug:${clientIp(req)}`, 60, 60))) return NextResponse.json({ valid: false, available: false, error: "Too many checks. Wait a moment." }, { status: 429 });
  const u = new URL(req.url);
  const slug = u.searchParams.get("slug") ?? "";
  const exclude = u.searchParams.get("exclude") ?? undefined;
  const error = checkSlug(slug);
  if (error) return NextResponse.json({ valid: false, available: false, error });
  let available: boolean;
  try { available = await slugAvailable(slug, exclude); } catch { return NextResponse.json({ valid: true, available: false, error: "Could not check right now. Please try again." }, { status: 503 }); }
  return NextResponse.json({ valid: true, available, error: available ? null : "That URL is already taken." });
}
