import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What UniqueVerse stores when you create a website, where it is kept, who can see it and how to ask for deletion.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated={LAST_UPDATED}>
      <p>This page explains what UniqueVerse collects, why, and what choices you have. We describe how the service works today, and we will update this page before we change it.</p>
      <h2>What we store</h2>
      <ul>
        <li><strong>Your account:</strong> your name, your email address and your password (the password is handled by our sign-in provider and we never see it), plus an optional profile picture.</li>
        <li><strong>Tokens and payments:</strong> your token balance and history. When you ask for tokens we store the amount, the transaction ID if you give one, and the payment screenshot you upload. We use these only to check your payment by hand.</li>
        <li><strong>What you enter:</strong> names, nickname, sender name and the message you write for a website.</li>
        <li><strong>Photos you choose to upload.</strong> Photos are optional. Your browser shrinks them before upload.</li>
        <li><strong>Your settings:</strong> the template you chose, your link name and your QR code design.</li>
        <li><strong>Anonymous visit counts:</strong> which page was opened (for example /templates), which template page was viewed, and whether a website was generated successfully. We do not record names, messages, photos or your private website links in these counts.</li>
        <li><strong>Technical logs:</strong> our hosting providers may record things like your IP address, browser type and the pages requested, to run and protect the service.</li>
      </ul>
      <p>You need a free account to generate a website. We do not ask for your phone number or address. Payment screenshots can show details of your payment account, so please hide anything you do not want us to see.</p>
      <h2>Where it is kept</h2>
      <p>The site is served by Vercel. Your website content and photos are stored with Supabase (a database and file storage provider). We do not sell your data.</p>
      <h2>On your own device</h2>
      <p>To let you come back and edit, your browser keeps a draft of your answers and a private edit key for each website you create. For the anonymous visit counts it also keeps a random visitor code (not linked to your name or account). This uses your browser&rsquo;s local storage, not cookies. If you clear your browser data or switch device, you will lose access to the dashboard for that website, and you will need to contact us.</p>
      <h2>Who can see your website</h2>
      <p>Anyone who has your link can open your website and see its names, message and photos. Links are not listed or searchable on our site and we ask search engines not to index them, but they are not password-protected. Please do not put sensitive information in a website, and only upload photos of other people if they agree.</p>
      <h2>Analytics, ads and cookies</h2>
      <p>We use our own simple, anonymous visit counting (described above) to see which pages and templates are used. We do not use advertising, and we do not use tracking cookies. If we add ads or third-party analytics, we will update this page and our <Link href="/cookies">Cookie Policy</Link> first, and ask for consent where the law requires it.</p>
      <h2>How long we keep data, and deletion</h2>
      <p>We keep your account and websites until you ask us to delete them, or until we remove them (for example if it breaks our <Link href="/terms">Terms</Link> or looks abandoned). There is no self-service delete button yet. To delete a website, its photos or your account, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the website link. We may ask you to show that the website is yours.</p>
      <h2>Children</h2>
      <p>UniqueVerse is meant for a general audience. If you are young, please ask a parent or guardian before uploading photos or using real names.</p>
      <h2>Security</h2>
      <p>Photos are kept in private storage and delivered through our site, and connections use HTTPS. No online service is perfectly secure, so we cannot promise absolute security.</p>
      <h2>Changes and contact</h2>
      <p>We may update this policy and will change the date above when we do. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  );
}
