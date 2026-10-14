import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomizeEditor from "@/components/customize/CustomizeEditor";
import { templates, getTemplateById } from "@/data/templates";
import { getContentConfig } from "@/data/templateContent";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Customize | UniqueVerse" };

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export default function CustomizePage({ params }: Props) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <Editor params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

async function Editor({ params }: Props) {
  const { id } = await params;
  const template = getTemplateById(id);
  if (!template) notFound();
  return <CustomizeEditor template={template} config={getContentConfig(template)} />;
}
