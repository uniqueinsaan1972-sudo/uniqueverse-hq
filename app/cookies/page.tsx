import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "UniqueVerse currently sets no tracking cookies. This page explains what is stored in your browser.",
  alternates: { canonical: "/cookies" },
};

export default function Cookies() {
  return (
    <LegalPage title="Cookie Policy" updated={LAST_UPDATED}>
      <p>UniqueVerse does not set advertising or tracking cookies. The only cookies are sign-in cookies, set when you sign in to your account (or when the site owner signs in to the admin area), so that the site knows who you are.</p>
      <h2>What is stored in your browser</h2>
      <ul>
        <li><strong>Drafts:</strong> your unfinished answers for a template, so you do not lose them.</li>
        <li><strong>Visitor code:</strong> a random code used only for our anonymous visit counts. It is not linked to your name or account.</li>
        <li><strong>Site settings:</strong> a saved copy of the latest page texts, so pages load faster.</li>
        <li><strong>Edit key:</strong> a private key for each website you create, which lets you reopen its dashboard on that device.</li>
      </ul>
      <p>This is local storage in your browser, not a cookie, and it is not sent to advertisers. You can remove it by clearing your browser data, but then you will lose dashboard access for those websites.</p>
      <h2>Providers</h2>
      <p>Our hosting and storage providers may use technical logs or essential cookies to run and secure the service.</p>
      <h2>If this changes</h2>
      <p>If we add third-party analytics or ads in the future, we will update this page and our <Link href="/privacy">Privacy Policy</Link> before we start, and ask for your consent where required.</p>
    </LegalPage>
  );
}
