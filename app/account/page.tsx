import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountView from "@/components/account/AccountView";
import { container } from "@/lib/ui";

export const metadata: Metadata = { title: "My account | UniqueVerse", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Navbar />
      <main className={`${container} max-w-5xl py-10 sm:py-14`}>
        <AccountView />
      </main>
      <Footer />
    </>
  );
}
