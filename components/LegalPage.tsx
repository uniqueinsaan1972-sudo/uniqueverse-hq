import Navbar from "./Navbar";
import Footer from "./Footer";
import { container } from "@/lib/ui";

export default function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className={`${container} max-w-3xl py-14 sm:py-20`}>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {updated && <p className="mt-3 text-sm text-[#6B6B6B]">Last updated: {updated}</p>}
        <div className="mt-8 text-[15px] leading-relaxed text-[#3a3a3f] [&_a]:font-medium [&_a]:text-[#111111] [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#111111] [&_li]:mt-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
