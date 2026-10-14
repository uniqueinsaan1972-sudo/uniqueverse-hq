import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { btnPrimary, btnSecondary, container } from "@/lib/ui";

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}><Navbar /></Suspense>
      <main className={`${container} max-w-xl py-24 text-center sm:py-32`}>
        <p className="text-sm font-semibold text-[#6B6B6B]">Error 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">This page could not be found</h1>
        <p className="mt-4 text-[#6B6B6B]">The link may be wrong, or the page may have moved.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={btnPrimary}>Go home</Link>
          <Link href="/templates" className={btnSecondary}>Browse templates</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
