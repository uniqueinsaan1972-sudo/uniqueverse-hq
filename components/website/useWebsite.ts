"use client";
import { useEffect, useState } from "react";
import type { GeneratedWebsite } from "@/types/website";
import { fetchOwned } from "@/lib/client";

export function useWebsite(id: string) {
  const [site, setSite] = useState<GeneratedWebsite | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let off = false;
    fetchOwned(id)
      .then((r) => { if (!off) { setSite(r.website); setState("ready"); } })
      .catch((e: Error) => { if (!off) { setMessage(e.message); setState("error"); } });
    return () => { off = true; };
  }, [id]);
  return { site, setSite, state, message };
}
