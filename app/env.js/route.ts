import { publicEnv } from "@/lib/public-env";

/** Tiny script loaded before the page: gives the browser the public Supabase URL and publishable key. */
export function GET() {
  const { url, key } = publicEnv();
  const body = `window.__UV_ENV=${JSON.stringify({ url, key }).replace(/</g, "\\u003c")};`;
  return new Response(body, {
    headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" },
  });
}
