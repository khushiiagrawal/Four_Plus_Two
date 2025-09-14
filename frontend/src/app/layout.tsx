import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaShield | Digital Health Surveillance",
  description:
    "Smart Community Health Monitoring—AI and IoT powered Early Warning for Water-Borne Diseases in Rural India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-teal-50 via-sky-50 to-white dark:from-[#071c22] dark:via-[#08151a] dark:to-[#070d10]`}
      >
        <div className="min-h-dvh text-[#0f172a] dark:text-[#e2e8f0]">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
