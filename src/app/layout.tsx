import type { Metadata } from "next";
import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import TopNav from "@/components/nav/TopNav";
import BottomNav from "@/components/nav/BottomNav";
import { Footer } from "@/components/Footer";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const plexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-sans-condensed",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

const SITE_URL = "https://toothoftime.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tooth of Time — Trek 12-23",
    template: "%s · Tooth of Time",
  },
  description:
    "Philmont trek planning and pack-weight management. BSA Troop 241 · Trek 12-23 · June 14–28, 2026 · 81 miles · Super Strenuous.",
  openGraph: {
    title: "Tooth of Time — Trek 12-23",
    description:
      "Philmont trek planning and pack-weight management. BSA Troop 241 · June 14–28, 2026 · 81 miles.",
    url: SITE_URL,
    siteName: "Tooth of Time",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tooth of Time — Trek 12-23",
    description:
      "Philmont trek planning and pack-weight management. BSA Troop 241 · June 14–28, 2026 · 81 miles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexSansCondensed.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
