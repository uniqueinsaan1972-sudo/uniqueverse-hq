"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import { btn, input } from "@/components/admin/ui";
import { browserAuth } from "@/lib/supabase-browser";

export default function VerifyPage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    browserAuth().auth.mfa.listFactors().then(({ data }) => {
      const f = data?.totp?.[0];
      if (f) setFactorId(f.id); else router.replace("/admin/login");
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const sb = browserAuth();
    const ch = await sb.auth.mfa.challenge({ factorId });
    if (ch.error) return setMsg("Could not start the check. Please try again.");
    const v = await sb.auth.mfa.verify({ factorId, challengeId: ch.data.id, code: code.trim() });
    if (v.error) return setMsg("That code is wrong or expired.");
    router.replace("/admin"); router.refresh();
  };

  return (
    <AuthCard title="Enter your code" text="Open your authenticator app and type the 6-digit code for UniqueVerse.">
      <form onSubmit={submit} className="space-y-3">
        <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required aria-label="6-digit code" className={input} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
        {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
        <button type="submit" disabled={!factorId} className={`${btn} w-full`}>Verify</button>
      </form>
    </AuthCard>
  );
}
