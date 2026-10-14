import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QrEditor from "@/components/website/QrEditor";

export const metadata: Metadata = { title: "Customize QR | UniqueVerse", robots: { index: false } };

export default function QrPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}><Navbar /></Suspense>
      <Suspense fallback={<div className="min-h-[60vh]" />}><Content params={params} /></Suspense>
      <Footer />
    </>
  );
}
async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QrEditor id={id} />;
}
