"use client";
import { createBrowserClient } from "@supabase/ssr";

declare global { interface Window { __UV_ENV?: { url?: string; key?: string } } }

/**
 * Browser sign-in client. The URL and publishable key come from the build, or, if the build did not have them,
 * from /env.js which the server fills from its runtime settings.
 */
export function browserAuth() {
  const rt = typeof window !== "undefined" ? window.__UV_ENV : undefined;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || rt?.url;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || rt?.key;
  if (!url || !key) {
    throw new Error("Sign-in is not set up on this site yet. The owner must add the Supabase publishable key to the site (see SETUP.md, 'If sign-in says it is not set up').");
  }
  return createBrowserClient(url, key);
}
