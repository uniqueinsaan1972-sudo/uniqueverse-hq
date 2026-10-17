import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { balanceOf } from "@/lib/tokens";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ loggedIn: false, balance: 0 }, { headers: { "Cache-Control": "no-store" } });
  try {
    return NextResponse.json({ loggedIn: true, balance: await balanceOf(user.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ loggedIn: true, balance: 0 }, { headers: { "Cache-Control": "no-store" } });
  }
}
