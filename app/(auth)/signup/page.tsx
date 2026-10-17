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
  const next = safeNext(useSearchParams().get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (name.trim().length < 2) return setMsg("Please enter your name.");
    if (pw.length < 8) return setMsg("Use at least 8 characters for the password.");
    if (pw !== pw2) return setMsg("The two passwords do not match.");
    setBusy(true);
    let res;
    try {
      res = await browserAuth().auth.signUp({
        email: email.trim(), password: pw,
        options: { data: { full_name: name.trim().slice(0, 60) }, emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
    } catch (err) { setBusy(false); return setMsg(err instanceof Error ? err.message : "Could not create the account."); }
    const { data, error } = res;
    setBusy(false);
    if (error) return setMsg(error.message.toLowerCase().includes("already") ? "This email already has an account. Try signing in." : `Could not create the account: ${error.message}`);
    if (data.session) { router.replace(next); router.refresh(); return; }
    setDone(true);
  };

  return (
    <AuthCard title="Create your account" text="Your websites, links and QR codes are saved in your account.">
      {done ? (
        <p role="status" className="text-sm text-[#3a3a3f]">Almost done. We sent a link to <strong>{email}</strong>. Open it to confirm your email, then sign in.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input required autoComplete="name" aria-label="Your name" placeholder="Your name" maxLength={60} className={input} value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" required autoComplete="email" aria-label="Email" placeholder="Email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required autoComplete="new-password" aria-label="Password" placeholder="Password (8+ characters)" className={input} value={pw} onChange={(e) => setPw(e.target.value)} />
          <input type="password" required autoComplete="new-password" aria-label="Repeat password" placeholder="Repeat password" className={input} value={pw2} onChange={(e) => setPw2(e.target.value)} />
          {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
          <button type="submit" disabled={busy} className={`${btn} w-full`}>{busy ? "Creating..." : "Create account"}</button>
          <p className="text-xs text-[#6B6B6B]">By creating an account you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
        </form>
      )}
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="mt-4 block text-center text-sm font-medium text-[#6B6B6B] underline">I already have an account</Link>
    </AuthCard>
  );
}

export default function SignupPage() {
  return <Suspense><Form /></Suspense>;
}
