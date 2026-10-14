import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TemplatesExplorer from "@/components/TemplatesExplorer";

export const metadata: Metadata = {
  title: "Templates | UniqueVerse",
  description:
    "Explore beautiful experiences designed for birthdays, friendships, love, memories and every moment that deserves something special.",
};

export default function TemplatesPage() {
  return (
    <>
      <Navbar />
      <main>
        <TemplatesExplorer />
      </main>
      <Footer />
    </>
  );
}
