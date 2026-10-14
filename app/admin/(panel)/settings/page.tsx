"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserAuth } from "@/lib/supabase-browser";
import { Card, btn, btnLight, input } from "@/components/admin/ui";

function Password() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 10) return setMsg("Use at least 10 characters.");
    if (pw !== pw2) return setMsg("The two passwords do not match.");
    const { error } = await browserAuth().auth.updateUser({ password: pw });
    setMsg(error ? `Could not change it: ${error.message}` : "Password changed.");
    if (!error) { setPw(""); setPw2(""); }
  };
  const emailLink = async () => {
    const sb = browserAuth();
    const { data } = await sb.auth.getUser();
    if (!data.user?.email) return setMsg("Could not find your email.");
    const { error } = await sb.auth.resetPasswordForEmail(data.user.email, { redirectTo: `${location.origin}/auth/callback?next=/admin/reset` });
    setMsg(error ? `Could not send: ${error.message}` : `A reset link was sent to ${data.user.email}. Open it on this device.`);
  };
  return (
    <Card title="Change password">
      <form onSubmit={change} className="max-w-sm space-y-3">
        <input type="password" autoComplete="new-password" aria-label="New password" placeholder="New password (10+ characters)" className={input} value={pw} onChange={(e) => setPw(e.target.value)} />
        <input type="password" autoComplete="new-password" aria-label="Repeat new password" placeholder="Repeat new password" className={input} value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btn}>Change password</button>
          <button type="button" className={btnLight} onClick={emailLink}>Email me a reset link instead</button>
        </div>
      </form>
      {msg && <p role="status" className="mt-3 text-sm text-[#3a3a3f]">{msg}</p>}
    </Card>
  );
}

type Enroll = { id: string; qr: string; secret: string };

function TwoFactor() {
  const router = useRouter();
  const [factor, setFactor] = useState<string | null | undefined>(undefined);
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    const { data } = await browserAuth().auth.mfa.listFactors();
    setFactor(data?.totp?.[0]?.id ?? null);
  };
  useEffect(() => { const t = setTimeout(refresh, 0); return () => clearTimeout(t); }, []);

  const start = async () => {
    setMsg("");
    const sb = browserAuth();
    const { data: all } = await sb.auth.mfa.listFactors();
    for (const f of all?.all ?? []) if (f.status === "unverified") await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `UniqueVerse admin ${Date.now()}` });
    if (error || !data) return setMsg(error?.message ?? "Could not start 2FA. Is MFA enabled in Supabase?");
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };
  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enroll) return;
    const sb = browserAuth();
    const ch = await sb.auth.mfa.challenge({ factorId: enroll.id });
    if (ch.error) return setMsg(ch.error.message);
    const v = await sb.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.data.id, code: code.trim() });
    if (v.error) return setMsg("That code is wrong or expired. Try the new code from your app.");
    setEnroll(null); setCode(""); setMsg("2FA is now on. You will need a code each time you sign in.");
    await refresh(); router.refresh();
  };
  const off = async () => {
    if (!factor || !window.confirm("Turn off 2FA? Your account will be less safe.")) return;
    const { error } = await browserAuth().auth.mfa.unenroll({ factorId: factor });
    setMsg(error ? error.message : "2FA is off.");
    await refresh();
  };

  return (
    <Card title="Two-factor authentication (2FA)">
      {factor === undefined && <p className="text-sm text-[#6B6B6B]">Checking...</p>}
      {factor && <><p className="text-sm">2FA is <strong>on</strong>. You use an authenticator app when you sign in.</p><button type="button" onClick={off} className={`${btnLight} mt-3`}>Turn off 2FA</button></>}
      {factor === null && !enroll && <><p className="text-sm text-[#3a3a3f]">Adds a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Aegis...) to your login.</p><button type="button" onClick={start} className={`${btn} mt-3`}>Turn on 2FA</button></>}
      {enroll && (
        <form onSubmit={confirm} className="max-w-sm space-y-3">
          <p className="text-sm">1. Scan this QR code with your authenticator app.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="2FA QR code" className="h-44 w-44 rounded-xl border border-[#E7E7EA] bg-white p-2" />
          <p className="break-all text-xs text-[#6B6B6B]">Or type this key: {enroll.secret}</p>
          <p className="text-sm">2. Enter the 6-digit code it shows.</p>
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label="6-digit code" className={input} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          <button type="submit" className={btn}>Confirm and turn on</button>
        </form>
      )}
      {msg && <p role="status" className="mt-3 text-sm text-[#3a3a3f]">{msg}</p>}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Your admin account security.</p>
      <div className="mt-6 space-y-5"><Password /><TwoFactor /></div>
    </div>
  );
}
