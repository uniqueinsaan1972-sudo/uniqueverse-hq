import Link from "next/link";
import Logo from "./Logo";
import { container } from "@/lib/ui";

const cols = [
  { title: "Product", links: [["Templates", "/templates"], ["Categories", "/#categories"], ["How It Works", "/#how-it-works"]] },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["FAQ", "/faq"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookie Policy", "/cookies"], ["Disclaimer", "/disclaimer"]] },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#E7E7EA] bg-[#F7F7F8]">
      <div className={`${container} py-14`}>
        <div className="grid gap-10 md:grid-cols-[1.5fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#6B6B6B]">
              Create beautiful personal experiences for the people who matter.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="text-sm font-semibold">{c.title}</h4>
                <ul className="mt-4 space-y-3">
                  {c.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-[#6B6B6B] transition hover:text-[#111111]">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-12 border-t border-[#E7E7EA] pt-6 text-sm text-[#6B6B6B]">
          &copy; 2026 UniqueVerse. Made for meaningful moments.
        </p>
      </div>
    </footer>
  );
}
