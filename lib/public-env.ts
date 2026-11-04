import "server-only";

/**
 * The Supabase URL and PUBLISHABLE key the browser needs.
 * They are read when the site RUNS (not only when it was built), so a deploy made without a .env.local still works
 * as long as the worker has these runtime variables:
 *   SUPABASE_URL (already set for the server)  and  PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * Names are built from parts so Next.js cannot freeze an empty value into the site at build time.
 */
const read = (...parts: string[]) => (process.env as Record<string, string | undefined>)[parts.join("_")] ?? "";

export function keyKind(key: string): "empty" | "secret" | "publishable" | "unknown" {
  if (!key) return "empty";
  if (key.startsWith("sb_secret_")) return "secret";
  if (key.startsWith("sb_publishable_")) return "publishable";
  try {
    const role = JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64url").toString()).role;
    return role === "service_role" ? "secret" : role === "anon" ? "publishable" : "unknown";
  } catch { return "unknown"; }
}

export function publicEnv(): { url: string; key: string } {
  const url = read("NEXT", "PUBLIC", "SUPABASE", "URL") || read("PUBLIC", "SUPABASE", "URL") || read("SUPABASE", "URL");
  const key = read("NEXT", "PUBLIC", "SUPABASE", "PUBLISHABLE", "KEY") || read("PUBLIC", "SUPABASE", "PUBLISHABLE", "KEY");
  // never hand a secret key to the browser, whatever was pasted by mistake
  return { url: url.replace(/\/$/, ""), key: keyKind(key) === "secret" ? "" : key };
}
