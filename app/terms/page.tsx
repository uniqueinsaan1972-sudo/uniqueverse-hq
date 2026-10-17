import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using UniqueVerse, including what content is allowed.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated={LAST_UPDATED}>
      <p>By using UniqueVerse you agree to these terms. If you do not agree, please do not use the service.</p>
      <h2>The service</h2>
      <p>UniqueVerse lets you create a personal website from a template, share it with a link and make a QR code. We may change, pause or stop features at any time.</p>
      <h2>Accounts, tokens and payments</h2>
      <p>You need an account to generate a website. Some templates are free and some cost tokens; the price is shown before you generate. You buy tokens by sending money by one of the payment methods shown on the Top up page and sending us the proof. We check every payment by hand and add the tokens after we confirm it, which can take up to 24 hours. Tokens have no cash value. If a payment was a mistake or something went wrong, write to us and we will look at it case by case.</p>
      <h2>Your content</h2>
      <p>You keep ownership of what you add (text, names, photos). You give us permission to store it and show it to anyone who has your link, so the service can work. You are responsible for your content, and you confirm you have the right to use it, including photos of other people.</p>
      <h2>What is not allowed</h2>
      <ul>
        <li>Anything illegal, hateful, harassing, threatening or sexual, and anything involving minors in an unsafe way.</li>
        <li>Impersonating real people, police, government bodies, exam boards or companies, or making documents that look official.</li>
        <li>Pranks about death, accidents, illness, threats, money fraud or anything that could cause serious distress.</li>
        <li>Attempts to hack, overload or misuse the service, or to upload malicious files.</li>
        <li>Using someone else&rsquo;s photos or private details without their permission.</li>
      </ul>
      <h2>Removal</h2>
      <p>We may remove content or websites that break these rules, or that look abandoned, with or without notice. To report a website, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      <h2>No guarantees</h2>
      <p>The service is provided &ldquo;as is&rdquo;. We do not promise it will always be available, error-free or keep your website forever. Keep your own copies of photos and text you care about. To the extent the law allows, we are not responsible for losses that come from using the service.</p>
      <h2>Changes</h2>
      <p>We may update these terms and will change the date above. Continuing to use UniqueVerse means you accept the new terms. See also our <Link href="/privacy">Privacy Policy</Link> and <Link href="/disclaimer">Disclaimer</Link>.</p>
    </LegalPage>
  );
}
