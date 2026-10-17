"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/admin/AuthCard";
import { btn, input } from "@/components/admin/ui";
import { browserAuth } from "@/lib/supabase-browser";

/** Asks for an email and sends a reset link that comes back through /auth/callback. */
export default function ForgotForm({ next, backHref }: { next: string; backHref: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await browserAuth().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` }); } catch { /* same answer either way */ }
    setSent(true);
  };
  return (
    <AuthCard title="Reset password" text="We will email you a link to choose a new password.">
      {sent ? (
        <p role="status" className="text-sm text-[#3a3a3f]">If this email has an account, a link is on its way. Open it on this device. It expires after a while.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required aria-label="Email" placeholder="Email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className={`${btn} w-full`}>Send reset link</button>
        </form>
      )}
      <Link href={backHref} className="mt-4 block text-center text-sm font-medium text-[#6B6B6B] underline">Back to sign in</Link>
    </AuthCard>
  );
}
