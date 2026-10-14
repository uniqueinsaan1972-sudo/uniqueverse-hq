import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dashboard from "@/components/website/Dashboard";

export const metadata: Metadata = { title: "Your website | UniqueVerse", robots: { index: false } };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ done?: string }> };

export default function WebsitePage(props: Props) {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}><Navbar /></Suspense>
      <Suspense fallback={<div className="min-h-[60vh]" />}><Content {...props} /></Suspense>
      <Footer />
    </>
  );
}
async function Content({ params, searchParams }: Props) {
  const { id } = await params;
  const { done } = await searchParams;
  return <Dashboard id={id} done={done === "new" || done === "updated" ? done : undefined} />;
}
