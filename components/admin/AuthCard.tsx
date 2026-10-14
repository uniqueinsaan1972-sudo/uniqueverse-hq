import Link from "next/link";
import Logo from "@/components/Logo";

export default function AuthCard({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F7F7F8] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Link href="/" aria-label="UniqueVerse home"><Logo /></Link></div>
        <div className="rounded-2xl border border-[#E7E7EA] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {text && <p className="mt-1.5 text-sm text-[#6B6B6B]">{text}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-[#6B6B6B]">Private area. Access is checked on our server.</p>
      </div>
    </main>
  );
}
