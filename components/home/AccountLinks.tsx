"use client";
import Link from "next/link";
import { useSignedIn } from "@/lib/useSession";

/** Real sign-in / sign-up links (or "My account" when already signed in). */
export default function AccountLinks() {
  const signedIn = useSignedIn();
  return (
    <div className="mt-5 min-h-[3.25rem] text-sm text-[#6B6B6B]">
      {signedIn === null ? null : signedIn ? (
        <p>You are signed in. <Link href="/account" className="font-semibold text-[#111111] underline">Open My account</Link></p>
      ) : (
        <>
          <p className="flex items-center justify-center gap-4">
            <Link href="/login" className="font-semibold text-[#111111] underline">Sign In</Link>
            <span aria-hidden className="h-3 w-px bg-[#D9D9DE]" />
            <Link href="/signup" className="font-semibold text-[#111111] underline">Create Account</Link>
          </p>
          <p className="mt-1.5 text-xs">You can browse and try templates freely. A free account is needed to publish.</p>
        </>
      )}
    </div>
  );
}
