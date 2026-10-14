import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important notes about UniqueVerse templates, pranks, user content and availability.",
  alternates: { canonical: "/disclaimer" },
};

export default function Disclaimer() {
  return (
    <LegalPage title="Disclaimer" updated={LAST_UPDATED}>
      <h2>For fun and personal use</h2>
      <p>UniqueVerse templates are made for personal, friendly use. Any prank template is fictional and clearly a joke. It never accesses, scans or controls anyone&rsquo;s device.</p>
      <h2>Not official</h2>
      <p>UniqueVerse is not connected to any police force, government, school, exam board, bank or company. Templates must not be used to pretend otherwise.</p>
      <h2>User content</h2>
      <p>Websites are created by users. We do not check every website and are not responsible for what users write or upload, but we remove content that breaks our Terms when we find it.</p>
      <h2>Availability</h2>
      <p>Links, photos and QR codes may stop working if the service changes or is paused. If a printed QR code is important, keep a backup of your content. We cannot guarantee that every scanner and printer will read every QR design.</p>
    </LegalPage>
  );
}
