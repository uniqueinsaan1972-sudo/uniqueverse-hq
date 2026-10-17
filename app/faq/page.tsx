import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help Center and FAQ",
  description: "Answers about creating a UniqueVerse website, editing your link, photos and QR codes.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  ["What is UniqueVerse?", "A place to make a personal website for someone special. Choose a template, add names, a message and photos, then share your link or QR code."],
  ["Is it free?", "Browsing and previewing templates is free. Some templates are free to generate and some cost tokens. The price is shown on each template and before you generate."],
  ["How do tokens work?", "1 rupee is 1 token. Open Top up, choose how many tokens, send the money to one of the payment methods shown, then upload your screenshot. We check it and add the tokens, usually within 24 hours. Coupons can lower the amount you pay."],
  ["Do I need an account?", "Yes, a free account is needed to generate a website. Your websites, links and QR codes are saved in your account, so you can open them from any device."],
  ["How do I edit my website later?", "Open your website's dashboard right after making it and choose Edit Website. Your answers are already filled in, and saving changes is free and keeps the same link. In My account you can open the link and customize the QR code."],
  ["Can I change my link?", "Yes. On the dashboard, edit the link name and press Save URL. The old link redirects to the new one, and the QR code updates automatically."],
  ["Who can see my website?", "Anyone with your link. It is not password-protected and it is not listed in search engines, so share the link only with people you want to see it."],
  ["What about photos?", "Photos are optional. Your browser shrinks large photos before upload. You can replace the demo photos with your own, or keep them."],
  ["How do I make a QR code?", "It is created automatically after you generate your website. Open Customize QR to change the style, colors, frame and text, then download PNG or SVG."],
  ["How do I delete my website?", `Email ${CONTACT_EMAIL} with your website link and we will remove it. A delete button is planned.`],
];

export default function Faq() {
  return (
    <LegalPage title="Help Center and FAQ">
      <div className="divide-y divide-[#E7E7EA] rounded-2xl border border-[#E7E7EA]">
        {faqs.map(([q, a]) => (
          <details key={q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#111111]">
              {q}
              <span aria-hidden className="text-xl text-[#6B6B6B] transition group-open:rotate-45">+</span>
            </summary>
            <p className="!mt-3">{a}</p>
          </details>
        ))}
      </div>
      <p>Still stuck? Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  );
}
