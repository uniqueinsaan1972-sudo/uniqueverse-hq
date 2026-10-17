import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { balanceOf } from "@/lib/tokens";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    const db = adminDb();
    const [balance, sites, topups] = await Promise.all([
      balanceOf(user.id),
      db.from("websites").select("id,slug,template_id,created_at,qr").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(100),
      db.from("topups").select("id,tokens,payable,sent_amount,coupon,status,note,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: (user.user_metadata?.full_name as string | undefined) ?? "" },
      balance,
      websites: (sites.data ?? []).map((w) => ({ id: w.id, slug: w.slug, templateId: w.template_id, createdAt: w.created_at, qr: w.qr })),
      topups: topups.data ?? [],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("account me:", e instanceof Error ? e.message : "error");
    return NextResponse.json({ error: "Could not load your account. Please try again." }, { status: 500 });
  }
}
