import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { allow, clientIp } from "@/lib/ratelimit";

const PREFIX = /^data:image\/jpeg;base64,/;
const BODY = /^[A-Za-z0-9+/=]+$/;

export async function GET() {
  const user = await getUser();
  if (!user) return new Response("Not signed in", { status: 401 });
  const { data } = await adminDb().storage.from("media").download(`avatars/${user.id}.jpg`);
  if (!data) return new Response("No picture", { status: 404 });
  return new Response(new Uint8Array(await data.arrayBuffer()), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=60", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!(await allow(`avatar:${clientIp(req)}`, 20, 3600))) return NextResponse.json({ error: "Too many tries. Please wait a while." }, { status: 429 });
  let image = "";
  try { image = String((await req.json()).image ?? ""); } catch { /* handled below */ }
  const m = image.match(PREFIX);
  const b64 = m ? image.slice(m[0].length) : "";
  if (!m || !BODY.test(b64) || b64.length > 700_000) return NextResponse.json({ error: "Please choose a smaller JPEG, PNG or WebP picture." }, { status: 400 });
  const { error } = await adminDb().storage.from("media").upload(`avatars/${user.id}.jpg`, Buffer.from(b64, "base64"), { contentType: "image/jpeg", upsert: true });
  if (error) return NextResponse.json({ error: "Could not save your picture. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
