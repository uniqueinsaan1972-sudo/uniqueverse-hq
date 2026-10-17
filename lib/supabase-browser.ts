"use client";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser sign-in client. The URL and publishable key are baked into the site while it is built.
 * If they were missing at build time we say so clearly instead of crashing.
 */
export function browserAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Sign-in is not set up in this version of the site: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY was missing when it was built. The owner must add them to .env.local and run npm run deploy again.");
  }
  return createBrowserClient(url, key);
}
