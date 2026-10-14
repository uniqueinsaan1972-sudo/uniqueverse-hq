"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/admin/AuthCard";
import { btn, input } from "@/components/admin/ui";
import { browserAuth } from "@/lib/supabase-browser";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await browserAuth().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/auth/callback?next=/admin/reset` });
    setSent(true); // same answer whether or not the email exists
  };
  return (
    <AuthCard title="Reset password" text="We will email you a link to choose a new password.">
      {sent ? (
        <p role="status" className="text-sm text-[#3a3a3f]">If this email has an admin account, a link is on its way. Open it on this device. It expires after a while.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required aria-label="Email" placeholder="Email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className={`${btn} w-full`}>Send reset link</button>
        </form>
      )}
      <Link href="/admin/login" className="mt-4 block text-center text-sm font-medium text-[#6B6B6B] underline">Back to sign in</Link>
    </AuthCard>
  );
}
