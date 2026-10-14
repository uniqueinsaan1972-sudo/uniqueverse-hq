import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact UniqueVerse",
  description: "Questions, feedback or a removal request? Email the UniqueVerse team.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <LegalPage title="Contact us">
      <p>The best way to reach us is email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      <h2>You can write to us about</h2>
      <ul>
        <li>Questions or problems with creating or editing your website.</li>
        <li>A request to delete a website or its photos. Please include the website link.</li>
        <li>Reporting a website that breaks our <Link href="/terms">Terms</Link>.</li>
        <li>Ideas for new templates and features.</li>
      </ul>
      <p>We are a small team, so replies can take a few days. Please do not send passwords or private documents by email.</p>
    </LegalPage>
  );
}
