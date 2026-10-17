"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import { btn, input } from "@/components/admin/ui";
import { browserAuth } from "@/lib/supabase-browser";
import { safeNext } from "@/lib/nav";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(params.get("error") === "link" ? "That link is invalid or expired. Please ask for a new one." : "");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    let error;
    try { ({ error } = await browserAuth().auth.signInWithPassword({ email: email.trim(), password })); } catch (err) { setBusy(false); return setMsg(err instanceof Error ? err.message : "Could not sign in."); }
    if (error) {
      setBusy(false);
      const m = error.message.toLowerCase();
      return setMsg(m.includes("invalid login") ? "Wrong email or password." : m.includes("not confirmed") ? "Please confirm your email first. Check your inbox." : `Could not sign in: ${error.message}`);
    }
    router.replace(next); router.refresh();
  };

  return (
    <AuthCard title="Sign in" text="Welcome back. Sign in to see your websites and tokens.">
      <form onSubmit={submit} className="space-y-3">
        <input type="email" required autoComplete="username" aria-label="Email" placeholder="Email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required autoComplete="current-password" aria-label="Password" placeholder="Password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
        <button type="submit" disabled={busy} className={`${btn} w-full`}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
      <div className="mt-4 flex justify-between text-sm font-medium text-[#6B6B6B]">
        <Link href="/forgot" className="underline">Forgot password?</Link>
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="underline">Create account</Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return <Suspense><Form /></Suspense>;
}
