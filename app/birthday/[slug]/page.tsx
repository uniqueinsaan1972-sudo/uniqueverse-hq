import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicSite from "@/components/PublicSite";
import { getPublicBySlug } from "@/lib/store";
import { getTemplateById } from "@/data/templates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A birthday surprise for you", robots: { index: false } };

/** The finished website. Unknown or invalid links return a real 404 status. */
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 60) notFound();
  let found;
  try { found = await getPublicBySlug(slug); } catch { notFound(); }
  if (!found) notFound();
  if ("redirectTo" in found) redirect(`/birthday/${found.redirectTo}`);
  if (!getTemplateById(found.templateId)?.previewUrl) notFound();
  return <PublicSite templateId={found.templateId} content={found.data} />;
}
