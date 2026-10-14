"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { container } from "@/lib/ui";

const links = [
  { label: "Home", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "Categories", href: "/#categories" },
  { label: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "border-[#E7E7EA] bg-white/85" : "border-transparent bg-white/50"
      }`}
    >
      <div className={`${container} flex h-16 items-center justify-between`}>
        <Link href="/" aria-label="UniqueVerse home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`text-sm font-medium transition hover:text-[#111111] ${pathname === l.href ? "text-[#111111]" : "text-[#6B6B6B]"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/templates" className="inline-flex h-10 items-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]">
            Create Yours
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E7EA] md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[#E7E7EA] bg-white md:hidden"
          >
            <div className={`${container} flex flex-col py-4`}>
              {links.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="py-3.5 text-base font-medium">
                  {l.label}
                </Link>
              ))}
              <Link href="/templates" onClick={() => setOpen(false)} className="mt-3 inline-flex h-12 items-center justify-center rounded-full bg-[#111111] text-[15px] font-semibold text-white">
                Create Yours
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
