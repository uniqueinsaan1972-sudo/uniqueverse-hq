import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getPricing } from "@/lib/tokens";

/** Payment details are shown only to signed-in users. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    return NextResponse.json(await getPricing(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load payment details." }, { status: 500 });
  }
}
