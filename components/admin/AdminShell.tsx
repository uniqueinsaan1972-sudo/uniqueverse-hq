"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Globe, Home, LayoutTemplate, LogOut, Menu, Settings, X, LayoutDashboard } from "lucide-react";
import Logo from "@/components/Logo";
import { browserAuth } from "@/lib/supabase-browser";

const nav = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/websites", label: "Websites", Icon: Globe },
  { href: "/admin/templates", label: "Templates", Icon: LayoutTemplate },
  { href: "/admin/homepage", label: "Home page", Icon: Home },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const signOut = async () => { await browserAuth().auth.signOut(); router.replace("/admin/login"); router.refresh(); };

  const links = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {nav.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${active ? "bg-[#111111] text-white" : "text-[#6B6B6B] hover:bg-[#F7F7F8] hover:text-[#111111]"}`}>
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#E7E7EA] bg-white px-4 lg:hidden">
        <Logo size={26} />
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E7EA]">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>
      {open && <div className="fixed inset-x-0 top-14 z-30 border-b border-[#E7E7EA] bg-white p-4 lg:hidden">{links}</div>}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-[#E7E7EA] bg-white p-4 lg:flex">
        <div className="px-2 py-2"><Logo /></div>
        <div className="mt-6 flex-1">{links}</div>
        <div className="border-t border-[#E7E7EA] pt-4">
          <p className="truncate px-2 text-xs text-[#6B6B6B]">{email}</p>
          <button type="button" onClick={signOut} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#6B6B6B] transition hover:bg-[#F7F7F8] hover:text-[#111111]"><LogOut size={18} /> Sign out</button>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8 lg:ml-60 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
        <div className="mx-auto mt-8 max-w-5xl lg:hidden"><button type="button" onClick={signOut} className="text-sm font-medium text-[#6B6B6B] underline">Sign out</button></div>
      </main>
    </div>
  );
}
