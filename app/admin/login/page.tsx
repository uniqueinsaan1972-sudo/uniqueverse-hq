"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import { btn, input } from "@/components/admin/ui";
import { browserAuth } from "@/lib/supabase-browser";

const notices: Record<string, string> = {
  denied: "This account is not allowed in the admin area.",
  config: "Admin sign-in is not set up yet on the server.",
  link: "That link is invalid or expired. Please ask for a new one.",
};

function Form() {
  const router = useRouter();
  const err = useSearchParams().get("error") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(notices[err] ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (err === "denied") browserAuth().auth.signOut(); }, [err]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    const sb = browserAuth();
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setBusy(false); return setMsg("Wrong email or password."); }
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    router.replace(aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2" ? "/admin/verify" : "/admin");
    router.refresh();
  };

  return (
    <AuthCard title="Admin sign in" text="Only the UniqueVerse owner can sign in here.">
      <form onSubmit={submit} className="space-y-3">
        <input type="email" required autoComplete="username" aria-label="Email" placeholder="Email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required autoComplete="current-password" aria-label="Password" placeholder="Password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
        <button type="submit" disabled={busy} className={`${btn} w-full`}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
      <Link href="/admin/forgot" className="mt-4 block text-center text-sm font-medium text-[#6B6B6B] underline">Forgot password?</Link>
    </AuthCard>
  );
}

export default function LoginPage() {
  return <Suspense><Form /></Suspense>;
}
