import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConfigLoader } from "@/lib/config-client";
import Tracker from "@/components/Tracker";
import { SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: "UniqueVerse", type: "website" },
  title: "UniqueVerse | Create something they'll never forget",
  description:
    "Turn your memories, wishes, photos and feelings into a beautiful personal website made just for someone special.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <ConfigLoader />
        <Tracker />
        {children}
      </body>
    </html>
  );
}
