import { NextResponse } from "next/server";
import { loadPublicConfig } from "@/lib/config-server";

export async function GET() {
  try {
    return NextResponse.json(await loadPublicConfig(), { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return NextResponse.json({ home: {}, templates: {}, categories: [], pricing: { defaultPrice: 99, minTopup: 99, maxTopup: 9999 } }, { headers: { "Cache-Control": "no-store" } });
  }
}
