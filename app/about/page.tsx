import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "About UniqueVerse",
  description: "UniqueVerse helps you turn names, wishes and photos into a personal website and QR code for someone special.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <LegalPage title="About UniqueVerse">
      <p>UniqueVerse is a place to create a small personal website for someone you care about. You pick a template, add a name, a message and photos, and get a private link and a QR code you can share.</p>
      <h2>What you can do</h2>
      <ul>
        <li>Start from a ready-made template, such as an interactive birthday surprise.</li>
        <li>Change the names, the message and the photos. The preview updates as you type.</li>
        <li>Get a link you can edit, and a QR code you can restyle, download and print.</li>
      </ul>
      <h2>Our idea</h2>
      <p>Some moments deserve more than a message. A text can be forgotten; a beautiful experience can become a memory. Our tagline is <strong>Your moments. Your universe.</strong></p>
      <h2>Where we are</h2>
      <p>UniqueVerse is a small independent project and it is still new. We add templates and features step by step, and we would like to hear what you want next. See our <Link href="/contact">Contact</Link> page.</p>
      <p>Ready to try it? <Link href="/templates">Browse templates</Link>.</p>
    </LegalPage>
  );
}
