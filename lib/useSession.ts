"use client";
import { useEffect, useState } from "react";
import { browserAuth } from "@/lib/supabase-browser";

/** true = signed in, false = signed out, null = still checking. Reads the real sign-in session. */
export function useSignedIn() {
  const [v, setV] = useState<boolean | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      try { browserAuth().auth.getSession().then(({ data }) => setV(Boolean(data.session))).catch(() => setV(false)); } catch { setV(false); }
    }, 0);
    return () => clearTimeout(t);
  }, []);
  return v;
}
