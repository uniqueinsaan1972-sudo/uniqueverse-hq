"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import { btn, input } from "@/components/admin/ui";
import { browserAuth } from "@/lib/supabase-browser";

export default function ResetPage() {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { browserAuth().auth.getUser().then(({ data }) => setOk(Boolean(data.user))); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 10) return setMsg("Use at least 10 characters.");
    if (pw !== pw2) return setMsg("The two passwords do not match.");
    const { error } = await browserAuth().auth.updateUser({ password: pw });
    if (error) return setMsg(`Could not change it: ${error.message}`);
    router.replace("/admin"); router.refresh();
  };

  return (
    <AuthCard title="Choose a new password">
      {ok === false ? (
        <p className="text-sm text-[#3a3a3f]">This link is invalid or expired. <Link href="/admin/forgot" className="font-semibold underline">Ask for a new one</Link>.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input type="password" autoComplete="new-password" aria-label="New password" placeholder="New password (10+ characters)" className={input} value={pw} onChange={(e) => setPw(e.target.value)} />
          <input type="password" autoComplete="new-password" aria-label="Repeat new password" placeholder="Repeat new password" className={input} value={pw2} onChange={(e) => setPw2(e.target.value)} />
          {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
          <button type="submit" disabled={ok === null} className={`${btn} w-full`}>Save new password</button>
        </form>
      )}
    </AuthCard>
  );
}
