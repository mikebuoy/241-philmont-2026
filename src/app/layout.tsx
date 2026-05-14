import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/nav/TopNav";
import BottomNav from "@/components/nav/BottomNav";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Trek 12-23 — Philmont 2026",
    template: "%s · Trek 12-23",
  },
  description:
    "BSA Troop 241 · Philmont Scout Ranch · June 14–27, 2026 · Two sister crews · 81 miles · Super Strenuous",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <TopNav />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
