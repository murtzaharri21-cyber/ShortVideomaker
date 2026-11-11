import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const body = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-family",
});

const display = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-family",
});

export const metadata: Metadata = {
  title: "VoltCut — Viral Shorts Builder",
  description:
    "Paste a YouTube, TikTok, or Facebook link — or upload a video. VoltCut cuts viral short clips, writes captions, and exports full-quality 9:16 downloads.",
  icons: { icon: "/images/logo-mark.png" },
  openGraph: {
    title: "VoltCut — Viral Shorts Builder",
    description: "Turn long videos into captioned Shorts, Reels, and TikToks.",
    images: ["/images/og.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} font-sans antialiased bg-white text-slate-950`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <div id="main" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
