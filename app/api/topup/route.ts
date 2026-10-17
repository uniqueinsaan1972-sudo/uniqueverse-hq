import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { adminDb } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { allow, clientIp } from "@/lib/ratelimit";
import { quote } from "@/lib/tokens";

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
const SHOT = /^data:image\/(png|jpeg|webp);base64,/;
const B64 = /^[A-Za-z0-9+/=]+$/;
const EXT: Record<string, string> = { png: "png", jpeg: "jpg", webp: "webp" };

/** A user says "I paid": we store the request and screenshot; the owner checks the payment and adds the tokens. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user || !user.email) return fail(401, "Please sign in.");
  if (!(await allow(`topup:${user.id}`, 5, 3600)) || !(await allow(`topupip:${clientIp(req)}`, 15, 3600))) return fail(429, "You sent too many requests. Please wait a while.");
  let b: { tokens?: unknown; coupon?: unknown; sentAmount?: unknown; txnId?: unknown; screenshot?: unknown };
  try { b = await req.json(); } catch { return fail(400, "Your request could not be read."); }

  const sent = Number(b.sentAmount);
  if (!Number.isInteger(sent) || sent < 1 || sent > 1_000_000) return fail(400, "Enter the amount you sent, in rupees.");
  const shot = typeof b.screenshot === "string" ? b.screenshot : "";
  const m = shot.match(SHOT);
  const data = m ? shot.slice(m[0].length) : "";
  if (!m || !B64.test(data) || data.length > 2_500_000) return fail(400, "Please add a clear screenshot (picture) of your payment.");
  const txn = typeof b.txnId === "string" ? b.txnId.trim().slice(0, 40) : "";

  const db = adminDb();
  const { count } = await db.from("topups").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending");
  if ((count ?? 0) >= 3) return fail(409, "You already have 3 requests waiting. Please wait until they are checked.");

  const q = await quote(user.id, b.tokens, b.coupon);
  if (!q.ok) return fail(400, q.error);

  let redeemed = false;
  if (q.coupon) {
    const r = await db.rpc("redeem_coupon", { p_code: q.coupon });
    if (r.error || !r.data) return fail(400, "This coupon is not valid or has run out.");
    redeemed = true;
  }
  const id = randomBytes(8).toString("hex");
  const path = `topups/${id}.${EXT[m[1]]}`;
  try {
    const up = await db.storage.from("media").upload(path, Buffer.from(data, "base64"), { contentType: `image/${m[1]}` });
    if (up.error) throw new Error(`screenshot upload failed: ${up.error.message}`);
    const ins = await db.from("topups").insert({
      id, user_id: user.id, email: user.email, tokens: q.tokens, payable: q.payable, sent_amount: sent, coupon: q.coupon, txn_id: txn || null, screenshot: path,
    });
    if (ins.error) throw new Error(`saving the request failed [${ins.error.code ?? "no-code"}]: ${ins.error.message}`);
    return NextResponse.json({ ok: true, id, payable: q.payable });
  } catch (e) {
    if (redeemed && q.coupon) await db.rpc("release_coupon", { p_code: q.coupon });
    console.error("topup failed:", e instanceof Error ? e.message.slice(0, 300) : "error");
    return fail(500, "Could not send your request. Please try again.");
  }
}
