import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/public-env";

/** Safe status page: only yes/no answers and the build time. Never a key or a URL. */
export function GET() {
  const { url, key } = publicEnv();
  return NextResponse.json({
    builtAt: process.env.UV_BUILD_TIME ?? "unknown",
    browserSignInReady: Boolean(url && key),
    publicUrlFoundAtBuild: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKeyFoundAtBuild: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    serverSecretsSet: { SUPABASE_URL: Boolean(process.env.SUPABASE_URL), SUPABASE_SECRET_KEY: Boolean(process.env.SUPABASE_SECRET_KEY), ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL) },
  }, { headers: { "Cache-Control": "no-store" } });
}
